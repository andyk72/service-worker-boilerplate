## service-worker-boilerplate

Service Worker basic functionalities boilerplate.

Based on https://mdn.github.io/sw-test/.
Many thanks to mdn to provide such clean a sample of the Service Worker basic usage.

Provides 3 objects aimed to help with Service Worker development:

1. CACHE_TO_INSTALL {Object}
    Provides the cache to be installed on Service Worker install
    User configurable
    Change the cache contents any time you want to update the application cache
    The default implementation provided (ServiceWorkerManager.Events.activate(event, cacheToCreate)), deletes any other cache

2. ServiceWorkerConfig {Object}
    Provides Service Worker behaviour configuration
    User Configurable
    Two properties are supported:
    1. skipWaiting (enables skipWaiting for immediate Service Worker activation Vs waiting state until browser page is reloaded)
    2. cacheResourcesAtRuntime (enables runtime requested resources caching)

3. ServiceWorkerManager {Object}
    Provides Service Worker high level functionalities

## Installation

Only manual installation is provided so far.

a) Use serviceWorker.js

1. Copy serviceWorker.js in project root directory
2. Customize CACHE_TO_INSTALL (line 4) contents at your needs
3. Customize ServiceWorkerConfig (line 25) at your needs

b) Use your own Service Worker and make use of service-worker-boilerplate features:

1. From serviceWorker.js copy and paste at the top of your Service Worker:

- ServiceWorkerConfig (lines 25-52)
- ServiceWorkerManager (lines 57-263)

2. Use them at your needs

## Running locally

To get this code, running locally on your computer as-is, you need to do the following:

1. Clone the repo in a location on your machine.
2. Start a local server running in the parent directory of the sw-test directory.
For example, if you have Python on your machine you could start a server running on port 8001 using `python -m SimpleHTTPServer 8001` for Python 2.x, or `python3 -m http.server 8001` for Python 3.x.
3. Navigate to the sw-test directory on the local server, e.g. [http://localhost:8001/service-worker-boilerplate/](http://localhost:8001/service-worker-boilerplate/)

Note: The example has to be located under the sw-test directory (e.g. http://localhost:8001/service-worker-boilerplate/) and not at the root of the server (e.g. http://localhost:8001/) or anywhere else, for the service worker to work. It expects the document and associated assets it is controlling to be at this location.
