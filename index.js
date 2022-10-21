import config from './config.js';
import RssFeedEmitter from 'rss-feed-emitter';
import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';

console.log(`Watchers : ${Object.keys(config.watchers).length}`);
console.log(`RSS Feeds : ${Object.keys(config.rssFeeds).length}`);

const findFeedByURL = (url) => {
    return Object.values(config.rssFeeds).find(x => {
        if (typeof x == 'string') return url == x
        return x.url == url
    })
}

const formatData = async (postData) => {
    const feedData = findFeedByURL(postData.meta.link)
    if (typeof feedData == 'string') return postData

    const updatedPostData = postData

    if (feedData.formatters) {
        for (const key in feedData.formatters) {
            updatedPostData[key] = feedData.formatters[key](updatedPostData[key],updatedPostData)
        }
    }

    if (feedData.linkDomElement) {
        const jsdomObject = await JSDOM.fromURL(postData.link)
        for (const key in feedData.linkDomElement) {
            updatedPostData[key] = feedData.linkDomElement[key](jsdomObject,updatedPostData)
        }
    }

    return updatedPostData;
}

const updateWebhook = async (url, postData) => {
    const rx = /https?:\/\/(.*)\.(?:.*)\//g
    const siteName = (rx.exec(postData.link)[1]).split('.').pop()
    const formattedData = await formatData(postData)
    const data = JSON.stringify({
        cards: [
            {
                header: {
                    title: formattedData.title,
                    subtitle: formattedData.subtitle || `${formattedData.author}@${siteName}`,
                    imageUrl: formattedData.logo
                },
                sections: [
                    {
                        widgets: [
                            {
                                image: {
                                    imageUrl: formattedData.contentImage,
                                }
                            },
                            {
                                textParagraph: {
                                    text: formattedData.description
                                }
                            },
                        ]
                    },
                    {
                        widgets: [
                            {
                                buttons: [
                                  {
                                    textButton: {
                                      text: "Read more",
                                      onClick: {
                                        openLink: {
                                          url: formattedData.link
                                        }
                                      }
                                    }
                                  },
                                  ...(formattedData.buttons || [])
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: data,
    })
}

const watcherObjects = [];

for (const watcher in config.watchers) {
    const watcherData = config.watchers[watcher];
    const watcherObject = new RssFeedEmitter({
        skipFirstLoad: config.skipFirstLoad,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
    });
    watcherObject.on('error', console.error);

    for (const feed of watcherData.feeds) {
        const feedConfig = config.rssFeeds[feed]
        if (typeof feedConfig == 'object') {
            watcherObject.add({ url:feedConfig.url, refresh: 2000 })
        } else {
            watcherObject.add({ url: feedConfig, refresh: 2000 })
        }
    }

    watcherObject.on('new-item', function (item) {
        updateWebhook(watcherData.webhook, item)
    })

    watcherObjects[watcher] = watcherObject
}