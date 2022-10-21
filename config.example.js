export default {
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
                link: (dom,data) => {
                    return data.structuredData.product.websiteUrl
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
                }
            }
        }
    },
    watchers: {
        techNews: {
            webhook: '',
            feeds: [
                'productHunt'
            ]
        }
    },
}