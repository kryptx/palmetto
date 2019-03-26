# Comparison to OpenID

In Palmetto, and in OpenID Connect, the user's authorization endpoint serves as a unique identifier of the person on the internet. It offers a standard interface to not only _authorize_ release of their data via some proprietary API, but also to _actually release it_ in a standardized envelope.

Compared to OpenID Connect, however, Palmetto is simple to understand and implement, as demonstrated by the Identity Provider and sample client application in this repository. Our hope is that this simplifies authentication and account creation flows, particularly for hobbyist and amateur developers, and virtually eliminates the need for any user to store or send any password unless it's the only way they can log into their identity provider.

## Palmetto Design Details
### User Agent Involvement
Palmetto proposes that the User Agent should be involved in authentication. All by itself, the ability to explicitly *request* or *provide intent* to initiate a login flow is a valuable tool for web developers which has been forgotten since the days of basic auth.

The first step is to use the `Authorization` and `WWW-Authenticate` header pair to request and initiate the authentication flow, respectively.

### Headers
Starting authentication with a header allows us to reclaim the ideas of "choose a user", "create account", and "log in", and put them back into the browser where they rightfully belong.

Since headers can't be encoded in URLs, if authentication always begins with a header it always begins with a trusted user-interface presented by the User Agent. Upon attempting to view a page that requires login, the site can send a traditional 401 with WWW-Authenticate header, prompting the User Agent to allow the user to select a Palmetto ID in that trusted interface, and begin the flow naturally.

This is directly in line with the original intent of the Authorization and WWW-Authenticate headers and gives greater power, security, and flexibility to end users.

### SRV Records
A Palmetto ID is meant to represent an identity, and therefore it's desirable that it be as easy to type and remember as an e-mail address.

It's also meant to represent a real _instance_ of a service which implements a particular interface.

While that interface is based on HTTPS, it's likely that identity providers will prefer to expose palmetto endpoints on non-standard ports or at highly qualified hostnames. SRV provides a layer of indirection to these implementations that does not impact the brevity of an ID. It also allows the URL to double as a public profile hosted by the PIP. Some of them may even provide a way for visitors to engage and request data.

### Root Document
Since the result of authentication is always data, and never a token authorizing access, there is little need for the client to provide anything other than its own callback and any values that the PIP does not understand. Were Palmetto to still require this and expect clients to dynamically register, the provisioning of an ID and Secret would not provide any security benefit compared to simply telling it where to find the callback. As a consequence, client registration serves little purpose.

Since this means the identity provider must be able to retrieve the root document, there is a theoretical problematic scenario:
1. An end-user wishes to authenticate with a resource server.
2. The resource server and the user are both behind a firewall that cannot be configured (for technical or corporate policy reasons) to expose any public port to the resource server in a way that allows it to receive an HTTPS request.
3. The resource server cannot trust any server for which the company *can* expose such a port to publish a callback URL that will allow the end user to continue.
4. The identity provider itself does not already have an interface which is behind the firewall (i.e. internal OAuth server).

However, that combination of facts is not commonly true. #3 in particular is almost always false. Even if you cannot publish your own root, more than likely, someone else can. Of course, this will sometimes represent an additional burden upon you to support it.

Having done this, there's no more need for the client to prove its identity to the user's own identity provider. Client ID and secret is not needed. Further, without those values, and with the rise of PKCE to replace hybrid flow for SPAs, there's far less ambiguity in grant types. In the case where an attacker manages to trick the user into visiting an authorization endpoint, one of the following will be true:
* If the endpoint is the user's own authorization endpoint, iframes should be broken, and they will be prompted that they are being asked to send their data to a site that they do not recognize or trust.
* If the endpoint is an authorization endpoint controlled by the attacker:
  * The attacker is trying to poison the user's session in the target application. The data was created by the attacker, and belongs to the attacker.
    * If the attacker logs into ANY application with this, his own account, no attack has taken place.
    * If the victim is tricked into logging into an attacker-owned application using an attacker-owned account, by skipping the proper checks, then no attack has taken place (it's no different from just adding that same fictional user data to the malicious session).
    * If the attacker sends the victim to an honest application that the user will recognize, the authentication request will be rejected because it was not requested with an Authorization header.

In short, this does not have any known risks, and results in a much simpler implementation for developers.
