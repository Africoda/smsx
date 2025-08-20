# Introduction to HTTP

## What is HTTP?

HTTP, or Hypertext Transfer Protocol, is the foundation of web communication. It defines how clients and servers can exchange data over a network
using text-based messages known as requests and responses.

### Key Characteristics of HTTP

1. **Client-Server Architecture**: In an HTTP server-client model, clients send HTTP requests to a server, which processes them and sends back HTTP
   responses.
2. **Statelessness**: Each request is processed independently without maintaining any state across requests.
3. **Versatility**: HTTP supports various methods like GET, POST, PUT, DELETE, etc., allowing for different types of operations (e.g., reading data,
   creating resources, updating data, deleting resources).
4. **Versioning**: Supports multiple versions, including HTTP/1.0 and HTTP/2, with HTTP/2 offering improved performance and efficiency.

### Examples of HTTP Methods

- **GET**: Used to retrieve data from a server.

  ```http
  GET /resource HTTP/1.1
  Host: example.com
  ```

- **POST**: Used to create new resources on the server.

  ```http
  POST /resource HTTP/1.1
  Host: example.com
  Content-Type: application/json
  {
    "name": "John Doe"
  }
  ```

- **PUT**: Used to update existing resources on the server.

  ```http
  PUT /resource HTTP/1.1
  Host: example.com
  Content-Type: application/json
  {
    "id": 1,
    "name": "Jane Doe"
  }
  ```

- **DELETE**: Used to delete resources from the server.
  ```http
  DELETE /resource HTTP/1.1
  Host: example.com
  ```

### Introduction to REST

**REST** is an architectural style that builds upon HTTP and emphasizes simplicity, scalability, and flexibility. It provides a standardized way for
building web applications by defining how resources are identified, manipulated, and accessed.

#### Key Principles of REST

1. **Statelessness**: Each request contains all necessary information for processing.
2. **Uniform Interface**:
   - Resources are identified using URIs (Uniform Resource Identifiers).
   - HTTP methods define operations on resources (e.g., GET, POST, PUT, DELETE).
   - Responses have a consistent structure and status codes.
3. **Cacheability**: Responses can be stored by clients to reduce load on servers.

#### RESTful Principles

- **Statelessness**: Each request contains all necessary information for processing.
- **Uniform Interface**:
  - Resources are identified using URIs.
  - HTTP methods define operations on resources (e.g., GET, POST, PUT, DELETE).
  - Responses have a consistent structure and status codes.
- **Cacheability**: Responses can be stored by clients to reduce load on servers.

#### Example of a RESTful API

```http
GET /users/1 HTTP/1.1
Host: example.com
```

This request retrieves the user with ID 1, while:

```http
POST /users HTTP/1.1
Host: example.com
Content-Type: application/json
{
  "name": "John Doe"
}
```

creates a new user.

### URL vs URI

- **URL**: A complete and absolute reference to a resource on the internet. It includes the protocol, hostname, port, path, query parameters, and
  fragment identifier.
  - Example: `http://example.com/users/1?filter=active#section`

- **URI**: An identification of a resource. It can be part of a URL or stand alone as an identifier. URIs are used to locate resources within the
  context of a particular protocol, such as HTTP.
  - Example: `/users/1` or `http://example.com/users/1`

### Status Codes

HTTP status codes provide information about the success or failure of an HTTP request, ranging from 200 (OK) to 500 (Internal Server Error).

- **2xx Success**: Indicates that the request was successful.
  - **200 OK**: The server successfully returned the requested resource.
  - **201 Created**: A new resource has been created on the server.

- **4xx Client Errors**: Indicate issues with the client's request.
  - **404 Not Found**: The requested resource could not be found on the server.

- **5xx Server Errors**: Indicate issues with the server's response.
  - **500 Internal Server Error**: An error occurred on the server while processing the request.

| Status Code                                        | Name                          | Description                                                                                                     |
| -------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 100                                                | Continue                      | The client should continue sending the request. No further action needs to be taken by the server until it      |
| completes.                                         |
| 101                                                | Switching Protocols           | Indicates that a switch has been made to a different protocol (e.g., from HTTP/1.0 to HTTP/2).                  |
|                                                    |
| 102                                                | Processing                    | The server is processing the request but no response has been sent yet.                                         |
|                                                    |
| 103                                                | Early Hints                   | Provides hints about the content of the response that will likely be returned with the next response.           |
|                                                    |
| 200                                                | OK                            | Indicates that the request was successful and the server returned a valid response body.                        |
|                                                    |
| 201                                                | Created                       | The server has successfully created a new resource and returned its URI in the Location header of the response. |
|                                                    |
| 202                                                | Accepted                      | Indicates that the request has been accepted for processing, but the process has not yet been completed.        |
|                                                    |
| 203                                                | Non-Authoritative Information | The server successfully processed the request, but returned information from another source.                    |
|                                                    |
| 204                                                | No Content                    | Indicates that the server successfully processed the request but did not return a response body.                |
|                                                    |
| 205                                                | Reset Content                 | Indicates that the server has cleared resources and returns an empty response body.                             |
|                                                    |
| 206                                                | Partial Content               | Indicates that the server is delivering part of a range request.                                                |
|                                                    |
| 300                                                | Multiple Choices              | Indicates that there are multiple choices for accessing the requested resource. The server should return the    |
| URI(s) of the available resources.                 |
| 301                                                | Moved Permanently             | Indicates that the requested resource has been permanently moved to a new URL. The client should update its     |
| references.                                        |
| 302                                                | Found                         | Indicates that the requested resource has temporarily moved to another URL. The client can use GET or HEAD to   |
| retrieve the new content at the given URI.         |
| 303                                                | See Other                     | Indicates that the requested resource is located at a different URI but should be retrieved using a GET method. |
|                                                    |
| 304                                                | Not Modified                  | Indicates that the request has not been modified since it was last retrieved. The client can use HEAD or GET to |
| retrieve the current content.                      |
| 305                                                | Use Proxy                     | Indicates that the requested resource must be accessed through a proxy server specified in the Location header  |
| of the response.                                   |
| 307                                                | Temporary Redirect            | Indicates that the requested resource has temporarily moved to another URL, and the client should use GET or    |
| HEAD to retrieve the new content at the given URI. |
| 308                                                | Permanent Redirect            | Indicates that the requested resource has permanently moved to a new URL, and the client can use GET or HEAD    |
| to retrieve the new content at the given URI.      |
| 400                                                | Bad Request                   | Indicates that the server cannot understand the request due to invalid syntax.                                  |
|                                                    |
| 401                                                | Unauthorized                  | Indicates that the request requires user authentication. The client must authenticate itself with the server    |
| before it can be granted access.                   |
| 402                                                | Payment Required              | Indicates that payment is required for accessing the requested resource, but the request was made without       |
| providing any payment information.                 |
| 403                                                | Forbidden                     | Indicates that the server refuses to authorize the request. The client does not have permission to access the   |
| requested resource.                                |
| 404                                                | Not Found                     | Indicates that the server cannot find the requested resource at the specified URI.                              |
|                                                    |
| 405                                                | Method Not Allowed            | Indicates that the request method is not allowed for the specified resource. The client must use a different    |
| method (e.g., GET, POST) to access the resource.   |
| 406                                                | Not Acceptable                | Indicates that the server cannot provide any of the requested media types in its response headers.              |
|                                                    |
| 407                                                | Proxy Authentication Required | Indicates that the client must authenticate itself with a proxy server before it can be granted access          |
| to the requested resource.                         |
| 408                                                | Request Timeout               | Indicates that the server timed out waiting for the request from the client.                                    |
|                                                    |
| 409                                                | Conflict                      | Indicates that the request could not be processed because of a conflict in the current state of the resource.   |
|                                                    |
| 410                                                | Gone                          | Indicates that the requested resource has been permanently deleted from the server. The client should not reuse |
| this URI for accessing the resource.               |
| 411                                                | Length Required               | Indicates that the server requires the request to include a content length header in its message body.          |
|                                                    |
| 412                                                | Precondition Failed           | Indicates that one or more conditions specified in the request headers could not be met by the server.          |
|                                                    |
| 413                                                | Payload Too Large             | Indicates that the client has sent a payload larger than the server is willing to process.                      |
|                                                    |
| 414                                                | URI Too Long                  | Indicates that the requested URI was too long for the server to process. The client should reduce the size of   |
| the request URI.                                   |
| 415                                                | Unsupported Media Type        | Indicates that the requested resource does not support the media type specified in the Content-Type header of   |
| the request.                                       |
| 416                                                | Range Not Satisfiable         | Indicates that the server cannot provide a part of the requested range (e.g., a specific byte range) from the   |
| resource.                                          |
| 417                                                | Expectation Failed            | Indicates that the expectation given in an Expect header could not be met by the server.                        |
|                                                    |
| 429                                                | Too Many Requests             | Indicates that the client has exceeded its rate limit for the requested resource. The client can retry the      |
| request after a period of time.                    |
| 500                                                | Internal Server Error         | Indicates that an error occurred on the server while processing the request.                                    |
|                                                    |
| 501                                                | Not Implemented               | Indicates that the server does not support the functionality required to fulfill the request.                   |
|                                                    |
| 502                                                | Bad Gateway                   | Indicates that the server received a valid response from a downstream server, but did not return the expected   |
| response.                                          |
| 503                                                | Service Unavailable           | Indicates that the server is temporarily unavailable (e.g., for maintenance). The client should retry the       |
| request after a period of time.                    |
| 504                                                | Gateway Timeout               | Indicates that the server did not receive a timely response from a downstream server or proxy server, and the   |
| request has timed out.                             |
| 505                                                | HTTP Version Not Supported    | Indicates that the server does not support the requested HTTP version in the request message.                   |
|                                                    |

This table provides a comprehensive overview of all HTTP status codes, helping developers understand what each code means and when to expect it.

### Conclusion

HTTP is the backbone of web communication, and understanding URLs (Uniform Resource Locators) and URIs (Uniform Resource Identifiers) is essential for
building and interacting with web applications. By breaking down these concepts, developers can better design and implement robust RESTful services.
