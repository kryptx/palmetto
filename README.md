# Palmetto Open Identity Standard
> It is not that we have so little time but that we lose so much. … The life we receive is not short but we make it so; we are not ill provided but use what we have wastefully.

*Seneca the Younger, De Brevitate Vitæ [ On the shortness of life ]*
## Introduction
Authentication and authorization are difficult topics for many developers.

Traditionally, applications were designed to require some identifying information like a unique username or e-mail address along with a password. Today this pattern is still widely used. More recently, many large companies (but most notably Google, Facebook, Twitter, and Github) have deployed OAuth2 services that allow users of their sites to grant client applications permission to access their information, and in doing so, bypass the registration step.

While this is convenient, there are a few problems.
1. The OAuth2 standard does not specify the interface that OAuth2 providers should offer for the retrieval of personal information. Because of this, OAuth clients (applications) tend to only support a few "social logins", and developers must explicitly enable support for each one individually.
2. For applications that only want information, the requirement to receive a token and then use it to request the data seems unnecessary in the first place.
3. Creating an account still requires either already being a user of one of their supported OAuth providers, or entering and remembering a password, which are often undesirable options.

Palmetto is a standard, not a service, which relies on the same three-legged authorization technique as OAuth2, with a few key differences:
* Every user has their own authorization endpoint.
* The result of successful authorization is *the requested data*, not a token.
* The interface for common user data (Palmetto's version of OAuth2's "scopes") is specified in the standard.

As a consequence, the user's authorization endpoint serves as a unique identifier of the person on the internet.

## Definitions

### Personal Identity Provider (PIP)

A service which includes at least one pair of endpoints dedicated to an individual user which enable client applications to retrieve information about that user.

### Identity Value (IV)

A string of data provided by a user to a PIP, such as a name or e-mail address.

## Components

### Resource Server

Just like OAuth2, a Resource Server is the server requesting user identity information. It is expected to implement two RESTful API endpoints in order to facilitate authentication with Palmetto:

#### Endpoint: Manifest document

The first endpoint is the manifest document. When sending an authorization request to a PIP, your Resource Server should include a `client` property which contains the URL to this document. It should be a JSON document containing:

* `callback` - A URL that can receive the authorization code. This can be on a different host, but doing so will result in a warning being displayed by the User Agent.

#### Endpoint: Palmetto Callback

This endpoint will receive the authorization code, and is responsible for exchanging it for information from the PIP, and sending the user on to their business.

### Personal Identity Provider (PIP)

The PIP should implement an endpoint for each user which will be used to retrieve data (via POST) when a valid authorization code is provided.

Relative to each such endpoint should be a corresponding `/authorize` endpoint that will ensure the user's presence (via whatever means the PIP implementer wishes).

Once the user decides whether to grant access, they are redirected to the `next` url that was provided in the authorization request.

### User Agent

User Agents should allow the user to specify what identity is used and, having done so, begin sending (e.g.) `Authorization: Palmetto https://palmetto.example.com/jsmith`.

Alongside the prompt for the user to authorize the release of the requested data, the User Agent should independently request the manifest document and prominently present the identifying details of the TLS certificate (especially the company name and domain name). If there is any security risk identified by the User Agent, the user should be adequately warned of the danger of proceeding. The mechanism for this process has not yet been determined, but is likely to be a header on the `/authorize` response.


