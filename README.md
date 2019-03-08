# Palmetto Open Identity Standard
> It is not that we have so little time but that we lose so much. … The life we receive is not short but we make it so; we are not ill provided but use what we have wastefully.

*Seneca the Younger, De Brevitate Vitæ [ On the shortness of life ]*
## Introduction
Palmetto is a delegated authentication standard for applications.

Traditionally, applications were designed to require some identifying information like a unique username or e-mail address along with a password. Today this pattern is still widely used. More recently, many large companies (but most notably Google, Facebook, Twitter, and Github) have deployed OAuth2 services that allow users of their sites to grant client applications permission to access their information, and in doing so, bypass the registration step.

While this is convenient, there are a few problems.
1. The OAuth2 standard does not specify the interface that OAuth2 providers should offer for the retrieval of personal information. Because of this, OAuth clients (applications) tend to only support a few "social logins", and developers must explicitly enable support for each one individually.
2. For applications that only want information, the requirement to receive a token and then use it to request the data is onerous, and developers of such applications are likely more confused by this "fourth leg" than by OAuth itself.
3. Creating an account still requires either already being a user of one of their supported OAuth providers, or entering and remembering a password, which are often undesirable options.

Palmetto is a standard which relies on the same three-party authorization technique as OAuth2, with a few key differences:
* Every user has their own authorization endpoint.
* The end result of successful authorization is *the requested data* (e.g., successful authentication), not an opaque token.
* The interface for common user data (Palmetto's version of OAuth2's "scopes") is specified in the standard.
* All data values are handled individually, unlike scopes which often grant access to broad areas of functionality.
* A client may specify optional user data values, for which authentication will be considered successful even if their release is not authorized.

As a consequence, the user's authorization endpoint serves as a unique identifier of the person on the internet. It offers a standard interface to not only _authorize_ release of their data via some proprietary API, but rather to _actually release it_ in a standardized envelope. This dramatically simplifies authentication and account creation flows, and virtually eliminates the need for any password or even cryptography (other than TLS).

While this may sound that we believe Palmetto is superior to OAuth, the reality is that both systems serve a valuable purpose in certain scenarios. Palmetto is meant only for retrieving user information, while OAuth facilitates authentication against any arbitrary API.

## Definitions

### Palmetto ID

A URL that can be used to retrieve information about a person, if authorized by that person.

### Identity Value (IV)

A string of data provided by a user to a PIP, such as a name or e-mail address. There are standard IVs and you may create any additional IVs that you wish. It is expected that custom IVs be prefixed with a namespace that will guarantee they will remain unique.

## Components

### Resource Server

Just like OAuth2, a Resource Server is the server requesting user identity information. It is expected to implement two API endpoints in order to facilitate authentication with Palmetto:

#### Endpoint: Manifest document

When sending an authorization request to a PIP, your Resource Server should include a `client` property which contains the URL to this document. It should be a JSON document containing:

* `callback` - A URL that can receive the authorization code. This can be on a different host, but doing so will result in a warning being displayed by the User Agent.

#### Endpoint: Palmetto Callback

This endpoint will receive the authorization code, and is responsible for exchanging it for information from the PIP, and sending the user on to their business. At this step, BEFORE attempting to perform the code exchange, implementations should:

* Validate a `state` value (provided by the server) which was sent to the authorize endpoint in the first redirect.
* Validate that the Palmetto ID in the authorization header (provided by the user) has not changed since authorization began.

### Personal Identity Provider (PIP)

A Personal Identity Provider is a service which includes at least one pair of endpoints dedicated to an individual user which enable client applications to retrieve information about that user.

The PIP must implement one endpoint for each user which will be used to retrieve data (via POST) when a valid authorization code is provided. This endpoint **is** that user's **Palmetto ID**.

Relative to each such endpoint must exist a corresponding `/authorize` endpoint that will ensure the user's presence (via whatever means the PIP implementer wishes) before prompting the user to release the requested IVs to the client.

Once the user authenticates and decides whether to grant access, they are redirected to the callback url in the manifest.

### User Agent

User Agents should allow the user to specify what identity is used and, having done so, begin sending (e.g.) `Authorization: Palmetto https://palmetto.example.com/jsmith`.

Alongside the prompt for the user to authorize the release of requested IVs, the User Agent should independently request the manifest document and prominently present the identifying details of the TLS certificate (especially the company name and domain name). If there is any security risk identified by the User Agent, the user should be adequately warned of the danger of proceeding. The mechanism for this process has not yet been determined.

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

## Problems

* DDOS
  * If this is to work with *any* identity provider, then resource servers must accept at least arbitrary authorization hostnames.
  * If resource servers accept arbitrary authorization hostnames, then they can be used to perform a DDOS attack.