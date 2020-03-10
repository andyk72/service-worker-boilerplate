/**
 * Define the cache to be installed here
 */
const CACHE_TO_INSTALL = {
  id: 'v1',
  items: [
    '/service-worker-boilerplate/',
    '/service-worker-boilerplate/index.html',
    '/service-worker-boilerplate/style.css',
    '/service-worker-boilerplate/app.js',
    '/service-worker-boilerplate/image-list.js',
    '/service-worker-boilerplate/star-wars-logo.jpg',
    '/service-worker-boilerplate/gallery/bountyHunters.jpg',
    '/service-worker-boilerplate/gallery/myLittleVader.jpg',
    '/service-worker-boilerplate/gallery/snowTroopers.jpg',
    '/service-worker-boilerplate/gallery/sci.jpg',
    '/service-worker-boilerplate/gallery/tigri.jpg',
    '/service-worker-boilerplate/gallery/windsurf.jpg'
  ]
};

/**
 * Service Worker Configuration
 */
const ServiceWorkerConfig = {
  /**
   * skipWaiting {Boolean}
   * Set this = false if you want the default Service Worker lifecycle (only a browser page/client reload allows the Service Worker to take control over the previous Service Worker, if any)
   * Set this = true if you do not want to wait for browser pages reload for the Service Worker to take control over the previous Service Worker, if any
   *  When false, the Service Worker lifecyle follows the default behaviour:
   *    1. install event
   *    2a. if previous Service Worker running
   *        . waiting state
   *        . on page/client reload -> goto (3) (previous Service Worker is deleted)
   *    2b. if no previous service Worker running
   *        . goto (3)
   *    3. activate event
   *    4. running state
   *  When true, the Service Worker lifecycle is altered, as the Service Worker is immediately activated after the install event:
   *    1. install event
   *    2. activate event
   *    3. running state
   */   
  skipWaiting: true,
  //clientsClaim: true TODO (not studied yet)
  /**
   * cacheResourcesAtRuntime {Boolean}
   *  When false, the resources fetched at runtime are not cached (only the resources defined in CACHE_TO_INSTALL.items are cached on install)
   *  When true, the resources fetched at runtime are cached according to the ServiceWorkerManager.Cache.cacheFetchedResponse(cacheId, request, response) implementation
   */
  cacheResourcesAtRuntime: true
};

/**
 * Service Worker Utilities
 */
const ServiceWorkerManager = {
  Events: {
    /**
     * Event listener for Service Worker 'install' event
     * 1. Logs the current cache to the console
     * 2. Skips waiting state (activates the Service Worker immediately) if defined in configuration (ServiceWorkerConfig.skipWaiting)
     * 3. Creates the initial cache with cacheToCreate data 
     * @param {Event} event 
     * @param {Object} cacheToCreate
     *  .id {String}
     *  .items {String[]}
     */
    install: function(event, cacheToCreate) {
      console.log('--------------------------------------> ServiceWorkerManager.Events.install()');
      ServiceWorkerManager.Cache.cacheLog();
      if (ServiceWorkerConfig.skipWaiting) {
        self.skipWaiting();
      }
      event.waitUntil(ServiceWorkerManager.Cache.createCache(cacheToCreate.id, cacheToCreate.items));
    },
    /**
     * Event listener for Service Worker 'activate' event
     * 1. Removes all caches except cacheToCreate (the cache being installed)
     * @param {Event} event 
     * @param {Object} cacheToCreate
     *  .id {String}
     *  .items {String[]}
     */
    activate: function(event, cacheToCreate) {
      console.log('--------------------------------------> ServiceWorkerManager.Events.activate()');
      event.waitUntil(ServiceWorkerManager.Cache.clearAllCacheExcept([cacheToCreate.id]));
    },
    /**
     * Event listener for Service Worker 'fetch' event
     * 1. If the resource has already been cached, the cached resource is fetched (no network request, perfect for offline scenario)
     * 2. If the resource has not been cached yet
     *  a) The resource is fetched from the network
     *  b) The fetched resource is stored into the application cache, if defined in configuration (ServiceWorkerConfig.cacheResourcesAtRuntime),
     *     ...according to the ServiceWorkerManager.Cache.cacheFetchedResponse(cacheId, request, response) implementation
     * @param {Event} event 
     * @param {Object} cacheToCreate
     *  .id {String}
     *  .items {String[]}
     */
    fetch: function(event, cacheToCreate) {
      console.log('--------------------------------------> ServiceWorkerManager.Events.fetch()');
      event.respondWith(
        caches.match(event.request).then(
          function(response) {
            console.log('response = ', response);
            // the resource is already cached -> return the cached item
            if (response !== undefined) {
              console.log('ALREADY CACHED ', response);
              return response;
            // the resource is not cached yet -> fetch it from the network and cache the response, if defined in configuration
            } else {
              console.log('TO BE CACHED ', event.request);
              return fetch(event.request).then(function (response) {
                if (ServiceWorkerConfig.cacheResourcesAtRuntime) {
                  ServiceWorkerManager.Cache.cacheFetchedResponse(cacheToCreate.id, event.request, response);
                }          
                return response;
              }).catch(function () {
                return caches.match('/service-worker-boilerplate/gallery/myLittleVader.jpg');
              });
            }
          }
        )
      );
    }
  },
  Cache: {
    /**
     * Returns if the caches object is defined
     * @return {Boolean}
     * @usage
     *  ServiceWorkerManager.Cache.isEnabled()
     */
    isEnabled: function() {
      return caches !== undefined && caches !== null;
    },
    /**
     * Returns a Promise that will contain the existing caches ids
     * Just a human readable alias for caches.keys()
     * @return {Promise}
     * @usage
     *  ServiceWorkerManager.Cache.getCacheIds().then(function(keys){
     *    console.log(keys)
     *  });
     */
    getCacheIds: function() {
      return caches.keys();
    },
    /**
     * Logs the cache to the console
     */
    cacheLog: function() {
      this.getCacheIds().then(function(ids){console.log('CACHES = ', ids)});
    },
    /**
     * Creates the cacheId cache and adds cacheItems to it
     * @param {String} cacheId 
     * @param {String[]} cacheItems
     *  Sample
     *    [
     *      '/service-worker-boilerplate/',
     *      '/service-worker-boilerplate/index.html',
     *      '/service-worker-boilerplate/style.css',
     *      '/service-worker-boilerplate/app.js',
     *      '/service-worker-boilerplate/star-wars-logo.jpg',
     *      '/service-worker-boilerplate/gallery/bountyHunters.jpg',
     *    ]
     */
    createCache: function(cacheId, cacheItems) {
      if (!this.isEnabled()) {
        console.warn('cache is not enabled');
        return;
      }
      console.log('CREATING CACHE ', cacheId);
      caches.open(cacheId).then(function(cache) {
        return cache.addAll(cacheItems);
      })
    },
    /**
     * Adds the item identified by itemRequest and itemData to the cacheId cache
     * @param {String} cacheId 
     * @param {Request} itemRequest 
     * @param {Response} itemResponse 
     */
    cacheItemAdd: function(cacheId, itemRequest, itemResponse) {
      if (!this.isEnabled()) {
        console.warn('cache is not enabled');
        return;
      }
      console.log('CACHING ', itemRequest, itemResponse);
      caches.open(cacheId).then(function (cache) {
        cache.put(itemRequest, itemResponse);
      });
    },
    /**
     * Caches the request's response into cacheId cache
     * Executed for any not yet cached asset requested from the network through the fetch method
     * A response clone is used, because response may be used only once and we need two copies:
     *  1. To be served to the application
     *  2. To be stored into cache 
     * @param {String} cacheId 
     * @param {Request} request 
     * @param {Response} response 
     */
    cacheFetchedResponse: function(cacheId, request, response) {
      let responseClone = response.clone();
      this.cacheItemAdd(cacheId, request, responseClone);
    },
    /**
     * Clears caches identified by cacheIds
     * @param {String[]} cachesIds 
     * @param {String} mode optional
     *  Determines if cachesIds are to be kept or to be deleted
     *  'delete' => default value, caches identified by cachesIds are deleted
     *  'keep' => caches identified by cachesIds are kept and the other caches are deleted
     * @usage
     *  ServiceWorkerManager.Cache.clearCache(['v1', 'v2'])
     *    Clears caches identified by 'v1' and 'v2' ids
     *  ServiceWorkerManager.Cache.clearCache(['v3'], 'keep')
     *    Clears all caches except cache identifid by 'v3'
     */
    clearCache: function(cachesIds, mode) {
      if (!this.isEnabled()) {
        console.warn('cache is not enabled');
        return;
      }
      if (!mode) {
        mode = 'delete';
      }
      this.getCacheIds().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          switch(mode) {
            // 'keep' mode
            case 'keep':
              if (cachesIds.indexOf(key) === -1) {
                console.log('CLEARING CACHE ', key);
                return caches.delete(key);
              }
              break;
            // 'delete' mode
            default:
              if (cachesIds.indexOf(key) !== -1) {
                console.log('CLEARING CACHE ', key);
                return caches.delete(key);
              }
          }
        })); 
      })
    },
    /**
     * Clear all caches except those identified by cacheIds
     * Convenience alias for ServiceWorkerManager.Cache.clearCache(<cacheIdsArray>, 'keep')
     * @param {String[]} cachesIds
     * @usage
     *  ServiceWorkerManager.Cache.clearAllCacheExcept(['v4'])
     *    Clears all caches except cache identifid by 'v4'
     */
    clearAllCacheExcept: function(cachesIds) {
      this.clearCache(cachesIds, 'keep');
    }
  }
};

/**
 * Service Worker install event
 * The Service Worker is installed and put into a waiting state (or running state, if skipWaiting is implemented).
 */
self.addEventListener('install', function(event) {
  console.log('--------------------------------------> serviceWorker event install');
  ServiceWorkerManager.Events.install(event, CACHE_TO_INSTALL);
});

/**
 * Service Worker activate event
 * The Service Worker is activated and put from a waiting into a running state.
 */
self.addEventListener('activate', (event) => {
  console.log('--------------------------------------> serviceWorker event activate');
  ServiceWorkerManager.Events.activate(event, CACHE_TO_INSTALL);
});

/**
 * Service Worker fetch event
 * Called for any resource request issued by the application.
 */
self.addEventListener('fetch', function(event) {
  console.log('--------------------------------------> serviceWorker event fetch');
  ServiceWorkerManager.Events.fetch(event, CACHE_TO_INSTALL);
});
