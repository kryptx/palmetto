# Palmetto Open Identity Standard
> It is not that we have so little time but that we lose so much. … The life we receive is not short but we make it so; we are not ill provided but use what we have wastefully.

*Seneca the Younger, De Brevitate Vitæ [ On the shortness of life ]*
## Introduction and Discussion
Palmetto is a delegated authentication standard for applications.

### Problem Statement

Traditionally, applications were designed to require some identifying information like a unique username or e-mail address along with a password. Today this pattern is still widely used. More recently, many large companies (but most notably Google, Facebook, Twitter, and Github) have deployed OAuth services that allow users of their sites to grant client applications permission to access their information, and in doing so, bypass the registration step.

While this is convenient, there are a few problems.
1. The OAuth standards do not specify the interface that OAuth providers should offer for the retrieval of personal information. Because of this, OAuth clients (applications) tend to only support a few "social logins", and developers must explicitly enable support for each one individually.
2. For applications that only want information, the requirement to receive a token and then use it to request the data is onerous, and developers of such applications are likely more confused by this "fourth leg" than by OAuth itself.
3. Creating an account still requires either already being a user of one of their supported OAuth providers, or entering and remembering a password, which are often undesirable options.

### Introducing Palmetto

Palmetto is a standard which relies on a very similar three-party authorization technique to OAuth2's authorization code flow (with PKCE), with a few key differences:
* Every user has their own authorization endpoint.
* Clients do not pre-register; instead, they publish a callback URL.
* The end result of successful authorization is *the requested data* (i.e. successful authentication), not an opaque token.
* The interface for common user data is specified in the standard.
* All data values are handled individually, unlike scopes which often grant access to broad areas of functionality.
* A client may specify optional user data values, for which authentication will be considered successful even if their release is not authorized.

The user's authorization endpoint serves as a unique identifier of the person on the internet. It offers a standard interface to not only _authorize_ release of their data via some proprietary API, but also to _actually release it_ in a standardized envelope. This dramatically simplifies authentication and account creation flows, and virtually eliminates the need for any password, other than the one protecting the identity itself.

While this may sound that we believe Palmetto is superior to OAuth, the reality is that both systems serve a valuable purpose in certain scenarios. Palmetto is meant only for retrieving user information, while OAuth is a complete standard for authorizing any application (particularly services) to perform any action at all that the user allows them to. In addition, a Palmetto Personal Identity Provider can rely on existing OAuth services to perform these authorizations.

In other words: OAuth is still the standard of choice for building applications that integrate with external services. Palmetto is meant to make "logging in" easier and safer for everyone, regardless of whether OAuth is used.

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
* `code_challenge_verifier` - the random value that was previously hashed to form `code_challenge`

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

| Property | Contents |
|---|---|
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
| `location.city` | City |
| `location.county` | County |
| `location.state` | State |
| `location.country` | Country |
| `location.province` | Province |
| `location.territory` | Territory |
| `location.postal_code` | Postal Code |

## Problems?

Open an issue.