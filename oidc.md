# Comparison to OpenID

In Palmetto, and in OpenID Connect, the user's authorization endpoint serves as a unique identifier of the person on the internet. It offers a standard interface to not only _authorize_ release of their data via some proprietary API, but also to _actually release it_ in a standardized envelope.

Compared to OpenID Connect, however, Palmetto is simple to understand and implement, as demonstrated by the Identity Provider and sample client application in this repository. Our hope is that this simplifies authentication and account creation flows, particularly for hobbyist and amateur developers, and virtually eliminates the need for any user to store or send any password unless it's the only way they can log into their identity provider.

## Palmetto Design Details
### User Agent Involvement
Palmetto proposes that the User Agent should be involved in authentication. All by itself, the ability to explicitly *request* or *provide intent* to initiate a login flow is a valuable tool for web developers which has been forgotten since the days of basic auth.

### Headers
The first step is to use the `Authorization` and `WWW-Authenticate` header pair to request and initiate the authentication flow, respectively. Starting authentication with a header allows us to reclaim the ideas of "choose a user", "create account", and "log in", and put them back into the browser where they belong.

Since headers can't be encoded in URLs, if authentication always begins with a header it always begins with a trusted user interface presented by the User Agent. Upon attempting to view a page that requires login, the site can send a traditional 401 with WWW-Authenticate header, prompting the User Agent to allow the user to select a Palmetto ID in that trusted interface, and begin the flow naturally.

This is directly in line with the original intent of the Authorization and WWW-Authenticate headers and gives greater power, security, and flexibility to end users.

#### Prevent CSRF without `state` or PKCE
Starting the flow with a header also allows resource servers to establish a session with the expected ID and validate that the data was for the expected user. In the case where an attacker manages to trick the user into visiting an authorization endpoint, one of the following will be true:
* The endpoint is the user's own authorization endpoint. Iframes should be broken, and the victim will be prompted unexpectedly, that they are being asked to send their data to a site that they do not recognize or trust.
* The endpoint is an authorization endpoint controlled by the attacker; the attacker is trying to poison a victim's session in some application.
    * The data was created by the attacker, and belongs to the attacker. If the attacker logs into ANY application with this, his own account, no attack has taken place.
    * If the application is honest, the authentication request will be rejected because it was not requested with an Authorization header.
    * If the application belongs to the attacker and skips the proper checks, then no attack has taken place; it's just a very roundabout way of writing the attacker's own made-up user data to a session.

### SRV Records
A Palmetto ID is meant to represent an identity, and therefore it's desirable that it be as easy to type and remember as an e-mail address.

It's also meant to represent a real _instance_ of a service which implements a particular interface.

While that interface is based on HTTPS, it's likely that identity providers will prefer to expose palmetto endpoints on non-standard ports or at highly qualified hostnames. SRV provides a layer of indirection to these deployments that does not impact the brevity of an ID. It also allows the URL to double as a public profile hosted by the PIP which could offer a wide variety of features to both the user and visitors.

### Root Document
Since the result of authentication is always data, and never a token authorizing access, there is little need for the client to provide anything other than its own callback and any values that the PIP does not understand. Were Palmetto to still require this and expect clients to dynamically register, the ad-hoc provisioning of an ID and Secret would not provide any security benefit compared to simply telling it where to find the callback.

Since this means the identity provider must be able to retrieve the root document, there is a theoretical problematic scenario:
1. An end-user wishes to authenticate with a resource server.
2. The resource server and the user are both behind a firewall that cannot be configured (for technical or corporate policy reasons) to expose any public port to the resource server in a way that allows it to receive an HTTPS request.
3. The resource server cannot rely on any server for which the company *can* expose such a port to publish a callback URL that will allow the end user to continue.
4. The identity provider itself does not already have an interface which is behind the firewall (i.e. internal OAuth server).

It's not clear what reason a user operating in such an environment would have to use a publicly deployed PIP. Normally, this would be a corporate environment. Most of the time in such an environment, there is already some mechanism for retrieving an access token, which is used for more than identity. To support Palmetto login, they would need (and, I think, they would _want_) to build an internal PIP which itself delegates to their existing OAuth provider, and/or upgrade their OAuth provider itself to be the PIP.

That does not change the fact that it fundamentally changes the flow, and there are applications using OAuth that may not have an obvious transition path to Palmetto.

Having inverted the flow in this way, there's no longer any need for the client to repeatedly assert its identity to identity providers.
### No grant types
OAuth and OpenID grant types are another area that seems to add complexity and needlessly intimidate developers. Client Credentials is irrelevant to us already. Resource Owner Password Flow also just does not make sense for delegating to an arbitrary authority. Implicit was recommended for SPAs, but these days Authorization Code with PKCE is recommended. Beyond that, grant types are all meant for delegating *authorization*. Hybrid flow is specifically for when you need an access token.

Why burden developers with having to learn "which grant type should I use"? If you are just creating signup/login features, you should be using Authorization Code.

If you're creating something else, use OpenID.
