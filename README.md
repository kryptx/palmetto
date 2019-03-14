# Palmetto Open Identity Standard
> It is not that we have so little time but that we lose so much. … The life we receive is not short but we make it so; we are not ill provided but use what we have wastefully.

*Seneca the Younger, De Brevitate Vitæ [ On the shortness of life ]*
## Introduction and Discussion
Palmetto is a delegated authentication standard being created for use in applications.

### Problem Statement

Traditionally, applications were designed to require some identifying information like a unique username or e-mail address along with a password. Today this pattern is still widely used. More recently, many large companies (but most notably Google, Facebook, Twitter, and Github) began deploying OAuth services that allowed users of their sites to grant client applications permission to access their information, and in doing so, bypass the registration step.

While this was convenient, there were a few problems.
1. The OAuth standards do not specify the interface that OAuth providers should offer for the retrieval of personal information. Because of this, OAuth clients (applications) tend to only support a few "social logins", and developers must explicitly enable support for each one individually.
2. For applications that only want information, the requirement to receive a token and then use it to request the data is onerous, and developers of such applications are likely more confused by this "fourth leg" than by OAuth itself.
3. Creating an account still requires either already being a user of one of their supported OAuth providers (there is no truly generic "OAuth Login"), or entering and remembering a password, which are often undesirable options.

Even more recently, the OpenID Connect (OIDC) standard has been published, which builds further on top of OAuth2 to address some of the above issues, along with Dynamic Client Registration which, theoretically, fully democratizes identity. Despite the efforts of multiple organizations to simplify use of the standard, the unfortunate reality is that because of the burden of understanding and implementing such a large standard, some significant portion of developers elect not to implement this interoperable form of delegated authentication and instead opt for re-implementing probably-insecure password schemes or a limited selection of identity providers.

### Introducing Palmetto

Palmetto is a standard under development which essentially extracts the concept of **an OpenID Connect authorization_code grant type with PKCE for `openid` scopes and `response_type: id_token`** into a single opinionated flow, offering direct, secure access to a user's identifying information no matter where they choose to store it.

Other than limiting flow, grant type, and response contents, some other choices have been made:
* The flow begins with an assertion to the resource server about the user's identity, including the custodian of the associated data.
  * Allows the resource server to know what users are trying to authenticate into it, even if they don't succeed.
* Servers are named by SRV records, so an ID is interpreted and resolved in a similar way to an e-mail address.
  * Helps keep IDs short.
  * Allows the ID to double as a public identity profile URL, if the Identity Provider wishes.
* Clients do not pre-register (nor do they dynamically register); instead, they publish a callback URL.
  * Eliminates dealing with secrets and having to pick a grant type. Palmetto is strictly for delegating _user authentication_.
  * It's worth noting that, while we believe it's small, this is genuinely a limitation of Palmetto compared to OpenID Connect. The Resource Server must be reachable from the Identity Provider's network.
* Data is returned directly in a response body, unsigned.
  * The signature itself proves a subset of that which is guaranteed by TLS, which is required by Palmetto.
  * Particularly sensitive resource servers may additionally choose to only allow authentication against identity providers presenting OV or EV certificates.
* All data values are handled individually; Identity Providers are expected to manage presentation to ensure users aren't visually overwhelmed.

As with OpenID Connect, the user's authorization endpoint serves as a unique identifier of the person on the internet. It offers a standard interface to not only _authorize_ release of their data via some proprietary API, but also to _actually release it_ in a standardized envelope.

Compared to OpenID Connect, however, Palmetto is simple to understand and implement, as demonstrated by the PIP and client in this repository. Our hope is that this simplifies authentication and account creation flows, particularly for hobbyist and amateur developers, and virtually eliminates the need for any user to store or send any password, other than the one protecting the identity itself if one exists.

Crucially, implementations of Identity Providers may choose to authenticate their users any way they wish, including using OpenID Connect or OAuth to delegate to another authority. Palmetto is solely intended to improve two things:

* The burden on the developer of an application that requires login, and
* The actual user interface required to actually "sign up" or "login".

## Definitions

### Palmetto Authorization Request
A request to a PIP to prompt the user to authorize the release of data, likely for the purpose of authentication. In this document, may be referred to as an "authorization request".

### Palmetto Authentication Request
A request to a Resource Server including a Palmetto ID, signaling that the user wants to provide identifying information. In this document, may be referred to as an "authentication request".

### Palmetto ID
A combination of a palmetto domain (a domain which has a palmetto SRV record) and a path, which can be used to retrieve information about a person if authorized by that person.

The protocol is omitted because:
* It is desirable that a Palmetto ID be able to be as short and convenient as an e-mail address.
* Since the URL is not requested directly for any part of the authorization flow, the protocol would have to be removed anyway.

### Identity Value (IV)

A string of data provided by a user to a PIP, such as a name or e-mail address. There are standard IVs and you may create any additional IVs that you wish. It is expected that custom IVs be prefixed with a namespace that will guarantee they will remain unique.

## Components

### Resource Server

Like OAuth, a Resource Server is the server requesting user identity information. It is expected to implement two API endpoints in order to facilitate authentication with Palmetto:

#### Endpoint: Palmetto Root

The Resource Server should provide a URL in the `client` field. When accessed over HTTPS, it should respond with a JSON object containing a `callback` property, which contains a valid Palmetto callback URL for this service.

The Palmetto Root must be reachable from any PIP that should be allowed to provide authentication for it. The callback URL itself need only be accessible from the network of your application's users.

This serves as an alternative to client pre-registration, and provides an opportunity for the end user to verify using TLS the entity which will be receiving their data.

#### Endpoint: Palmetto Callback

This endpoint will receive the authorization code, and is responsible for exchanging it for information from the PIP, and sending the user on to their business. At this step, BEFORE attempting to perform the code exchange, implementations SHOULD validate that the Palmetto ID in the query string matches the one that requested authorization for this session.

#### Initiating login
In the context of Palmetto, a "login request" or "authentication request" is a request to your resource server that contains an `Authorization` header which contains `Palmetto ` followed by a Palmetto ID.

Upon receiving an authentication request, the service MUST look up the _palmetto._tcp.host.com SRV record for the host, and use the result to request authorization. Preferably, the host should cache this lookup, since it will be needed to perform the callback.

Services MUST NOT use the Palmetto ID directly as a URL to authorize an authentication request.

An authorization request is performed by sending the User Agent to the host and port found in the SRV record, followed by the path, and the additional path component `/authorize`. For instance, if `_palmetto._tcp.plmto.com` resolves at highest priority to `login.palmetto-id.com:443` then an application receiving a Palmetto ID of `plmto.com/kryptx` should cause the browser to be redirected to https://login.palmetto-id.com:443/kryptx/authorize with the following query parameters:

* `id` - the Palmetto ID that has requested authentication.
* `client` - an HTTPS URL, owned by the requesting application, that will provide the callback URL.
* `require` - data that's required to continue, in the form of a comma-delimited list of IV keys.
* `request` - an additional comma-delimited list of IVs to request but which are not required.
* `code_challenge` - a Base64-encoded hash of a random value that has been stored by the resource server.
* `code_challenge_method` - the algorithm that was used to produce the hash. Should use the types specified by the IANA's PKCE Code Challenge Methods

#### Completing login
After the user has granted access to the required IVs to the satisfaction of the PIP owner, they will be redirected (with an `authorization_code` in the query string) to the callback specified in the Palmetto Root. The Resource Server sends an HTTPS POST to the base URL generated by the Palmetto ID (in the above example, to `https://login.palmetto-id.com:443/kryptx) with the following values in the request body:

* `code` - The authorization code presented by the end user.
* `code_challenge_verifier` - the random value that was previously hashed to form `code_challenge`.

The Resource server should verify that all required IVs are present.

* If not, it most likely means they are using a non-conforming PIP. You are encouraged to reject the authentication request.
* If so, the data may be treated as belonging to that Palmetto ID.

### Personal Identity Provider (PIP)

A Personal Identity Provider is a service which includes at least one pair of endpoints dedicated to an individual user which enable client applications to retrieve information about that user.

The PIP must implement one endpoint for each user which will be used to retrieve data (via POST) when a valid authorization code is provided. This endpoint **is** that user's **Palmetto ID**.

Relative to each such endpoint must exist a corresponding `/authorize` endpoint that will ensure the user's presence (via whatever means the PIP implementer wishes) before prompting the user to release the requested IVs to the client.

Once the user authenticates and decides whether to grant access, they are redirected to the callback url in the root document.

### User Agent

User Agents should allow the user to specify what identity is used and, having done so, provide an interface element that allows the user to reload the page and send a header of the form `Authorization: Palmetto {Palmetto ID}`, e.g. `Authorization: Palmetto https://palmetto.example.com/jsmith`.

Alongside the prompt for the user to authorize the release of requested IVs, the User Agent should independently request the Palmetto root document and prominently present the identifying details of the TLS certificate (especially the company name and domain name). If there is any security risk identified by the User Agent, the user should be adequately warned of the danger of proceeding. The mechanism for this process has not yet been determined.

## Authorization Flow

https://www.lucidchart.com/invitations/accept/5421b962-ddba-42f8-83c1-356896dc3d74

## Standard Identity Values

Some of the names shown below can be interpreted in an ambiguous way. In a sense, the functionality offered by Palmetto can be thought of as "delegated auto-fill". As such, we don't feel this is necessarily a problem.

Other names appear to be redundant. For instance, there are not only primary and secondary telephone, but also home, mobile, and work. Likely your primary is also one of those; we think it's reasonable for an application to request any dimension of your data, and don't believe it's a burden for a user to identify a phone number as both 'primary' and 'mobile'.

| Property | Contents |
|---|---|
| `id` | Palmetto ID |
| `locale` | Locale |
| `name.display` | Display name |
| `name.given` | Given (first) name |
| `name.middle` | Middle name |
| `name.family` | Family (last) name |
| `name.full` | Full name |
| `address.email` | Email address |
| `address.street` | Street (mailing) address |
| `telephone.primary` | Primary telephone |
| `telephone.secondary` | Secondary telephone |
| `telephone.home` | Home telephone |
| `telephone.work` | Work telephone |
| `telephone.mobile` | Mobile telephone |
| `location.locale` | Locale |
| `location.city` | City |
| `location.county` | County |
| `location.state` | State |
| `location.country` | Country |
| `location.province` | Province |
| `location.territory` | Territory |
| `location.postal_code` | Postal Code |
| `location.tz` | Time Zone (IANA Format) |

## Problems?

Open an issue.