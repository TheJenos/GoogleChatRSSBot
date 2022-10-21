import {JSDOM} from 'jsdom';

export default {
    skipFirstLoad: false,
    rssFeeds: {
        productHunt: {
            url:'https://www.producthunt.com/feed?category=undefined',
            refresh: 2000,
            linkDomElement: {
                structuredData: (dom) => {
                    const json = JSON.parse(dom.window.document.querySelector('#__NEXT_DATA__').textContent)
                    let data = {}
                    for (const key in json.props.apolloState) {
                        if (key.match(/Post\d+/g) && json.props.apolloState[key].structuredData) {
                            data['post'] = json.props.apolloState[key].structuredData.json
                        }

                        if (key.match(/Product\d+/g) && json.props.apolloState[key].websiteUrl) {
                            data['product'] = json.props.apolloState[key]
                        }
                    }
                    return data
                },
                subtitle: (dom,data) => {
                    return data.structuredData.product.tagline
                },
                description: (dom,data) => {
                    return data.structuredData.product.description
                },
                logo: (dom,data) => {
                    return data.structuredData.post.image
                },
                contentImage: (dom,data) => {
                    return data.structuredData.post.screenshot[0]
                },
                buttons: (dom,data) => {
                    return [
                        {
                            textButton: {
                                text: "Product Link",
                                onClick: {
                                    openLink: {
                                        url: data.structuredData.product.websiteUrl
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        laravelNews: {
            url:'https://feed.laravel-news.com/',
            refresh: 2000,
            formatters: {
                contentImage: (_,data) =>  {
                    const dom = new JSDOM(data.description)
                    return dom.window.document.querySelector('img').src
                },
                logo: (_,data) => data.meta.image.url
            }
        },
        xda: {
            url:'https://www.xda-developers.com/feed/',
            refresh: 2000,
            formatters: {
                contentImage: (_,data) =>  {
                    return data.enclosures[0].url
                },
                logo: (_,data) => "https://www.xda-developers.com/public/build/images/favicon-240x240.43161a66.png"
            }
        }
    },
    watchers: {
        techNews: {
            webhook: 'https://chat.googleapis.com/v1/spaces/AAAAnDpx7_8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=LP0Q7jr9MH7YOeBc9rRCrO_vE-ErsDPpaTP-OyDDlIA%3D',
            // webhook: 'https://chat.googleapis.com/v1/spaces/AAAASs9JrLQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=qOQja5RHvZ9xIfaB0eKF191lIYnjqWgr8DaCFiuTW4o%3D',
            feeds: [
                'productHunt',
                'laravelNews',
                'xda',
            ]
        }
    },
}