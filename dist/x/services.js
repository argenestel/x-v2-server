import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
/**
 * Twitter service for interacting with the Twitter API
 */
export class TwitterService {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        this.client = null;
    }
    /**
     * Get the singleton instance of TwitterService
     */
    static getInstance() {
        if (!TwitterService.instance) {
            TwitterService.instance = new TwitterService();
        }
        return TwitterService.instance;
    }
    /**
     * Initialize the Twitter client with credentials
     * @returns The initialized Twitter client
     */
    getClient() {
        if (!this.client) {
            if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_KEY_SECRET ||
                !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
                throw new Error('Twitter credentials are not properly configured in environment variables');
            }
            //   console.log('Initializing Twitter client with credentials:', {
            //     appKey: process.env.TWITTER_API_KEY,
            //     appSecret: `${process.env.TWITTER_API_KEY_SECRET?.substring(0, 5)}...`,
            //     accessToken: `${process.env.TWITTER_ACCESS_TOKEN?.substring(0, 5)}...`,
            //     accessSecret: `${process.env.TWITTER_ACCESS_TOKEN_SECRET?.substring(0, 5)}...`,
            //   });
            this.client = new TwitterApi({
                appKey: process.env.TWITTER_API_KEY,
                appSecret: process.env.TWITTER_API_KEY_SECRET,
                accessToken: process.env.TWITTER_ACCESS_TOKEN,
                accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
            });
            //  console.log('Twitter client initialized successfully');
        }
        return this.client;
    }
    /**
     * Get tweets for a specific user
     * @param userId The Twitter user ID
     * @param paginationToken Optional pagination token for fetching next page
     * @returns Promise resolving to user timeline data
     */
    async getUserTweets(userId, paginationToken, exclude, maxResults) {
        try {
            const client = this.getClient();
            const tweets = await client.v2.userTimeline(userId, {
                exclude: exclude ?? ["retweets", "replies"],
                max_results: 50,
                pagination_token: paginationToken,
            });
            return JSON.stringify({
                result: tweets.data,
                message: "Tweets fetched successfully",
            });
        }
        catch (error) {
            // Convert error to a string representation to avoid serialization issues
            const errorMessage = error;
            console.error('Error fetching tweets:', errorMessage);
            return error;
        }
    }
    /**
     * Get a single tweet by ID
     * @param tweetId The ID of the tweet to retrieve
     * @returns Promise resolving to the tweet data or null if not found
     */
    async getTweet(tweetId) {
        try {
            const client = this.getClient();
            const result = await client.v2.singleTweet(tweetId);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Get mentions for a specific user
     * @param userId The Twitter user ID
     * @param paginationToken Optional pagination token for fetching next page
     * @param maxResults Optional parameter to specify the number of results to return (default: 10)
     * @returns Promise resolving to user mention timeline data
     */
    async getUserMentionTimeline(userId, paginationToken, maxResults) {
        try {
            const client = this.getClient();
            const mentions = await client.v2.userMentionTimeline(userId, {
                max_results: maxResults || 10,
                pagination_token: paginationToken,
            });
            return mentions.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Quote a tweet with a comment
     * @param tweetId The ID of the tweet to quote
     * @param replyText The text to include with the quote
     * @returns Promise resolving to the created quote tweet data or error
     */
    async quoteAndComment(tweetId, replyText) {
        try {
            const client = this.getClient();
            const quote = await client.v2.quote(replyText, tweetId);
            return quote.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Reply to a tweet
     * @param tweetId The ID of the tweet to reply to
     * @param replyText The text content of the reply
     * @returns Promise resolving to the created reply tweet data or error
     */
    async replyToTweet(tweetId, replyText) {
        try {
            const client = this.getClient();
            const reply = await client.v2.reply(replyText, tweetId);
            return reply.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Post a new tweet, optionally with an image
     * @param text The text content of the tweet
     * @param imageBase64 Optional base64 encoded image to attach to the tweet
     * @returns Promise resolving to the created tweet data or error
     */
    async postTweet(text, imageBase64) {
        try {
            const client = this.getClient();
            if (imageBase64) {
                // Convert base64 to buffer
                const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                // Determine image type from base64 string
                let mimeType = EUploadMimeType.Jpeg;
                if (imageBase64.includes('data:image/png')) {
                    mimeType = EUploadMimeType.Png;
                }
                else if (imageBase64.includes('data:image/gif')) {
                    mimeType = EUploadMimeType.Gif;
                }
                else if (imageBase64.includes('data:image/webp')) {
                    mimeType = EUploadMimeType.Webp;
                }
                // Upload the media
                const mediaId = await client.v2.uploadMedia(buffer, {
                    media_type: mimeType,
                    media_category: 'tweet_image'
                });
                // Post tweet with media
                const tweet = await client.v2.tweet({
                    text,
                    media: {
                        media_ids: [mediaId]
                    }
                });
                return tweet.data;
            }
            else {
                // Post text-only tweet
                const tweet = await client.v2.tweet(text);
                return tweet.data;
            }
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Like a tweet with the authenticated user
     * @param tweetId The ID of the tweet to like
     * @returns Promise resolving to the like response data or error
     */
    async likeTweet(tweetId) {
        try {
            const client = this.getClient();
            // First get the authenticated user's ID
            const me = await client.v2.me();
            const result = await client.v2.like(me.data.id, tweetId);
            return { liked: result.data.liked };
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Follow a user
     * @param targetUserId The ID of the user to follow
     * @returns Promise resolving to the follow response data or error
     */
    async followUser(targetUserId) {
        try {
            const client = this.getClient();
            const me = await client.v2.me();
            const result = await client.v2.follow(me.data.id, targetUserId);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Unfollow a user
     * @param targetUserId The ID of the user to unfollow
     * @returns Promise resolving to the unfollow response data or error
     */
    async unfollowUser(targetUserId) {
        try {
            const client = this.getClient();
            const me = await client.v2.me();
            const result = await client.v2.unfollow(me.data.id, targetUserId);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Get user information by username
     * @param username The Twitter username (without @ symbol)
     * @returns Promise resolving to the user data or error
     */
    async getUserByUsername(username) {
        try {
            const client = this.getClient();
            const result = await client.v2.userByUsername(username);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Search tweets with a query
     * @param query The search query
     * @param maxResults Maximum number of results to return (default: 10)
     * @returns Promise resolving to an array of tweets or error
     */
    async searchTweets(query, maxResults = 10) {
        try {
            const client = this.getClient();
            const result = await client.v2.search(query, {
                max_results: maxResults,
            });
            return result.data.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Get trending topics for a specific location
     * @param woeid The "Where On Earth ID" (WOEID) for the location (e.g., 1 for worldwide)
     * @returns Promise resolving to trending topics or error
     */
    async getTrendingTopics(woeid = 1) {
        try {
            const client = this.getClient();
            const result = await client.v1.trendsAvailable();
            return result;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Create a new list
     * @param name The name of the list
     * @param description Optional description for the list
     * @param isPrivate Whether the list should be private (default: false)
     * @returns Promise resolving to the created list data or error
     */
    async createList(name, description, isPrivate = false) {
        try {
            const client = this.getClient();
            const result = await client.v2.createList({
                name,
                description,
                private: isPrivate,
            });
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Add a member to a list
     * @param listId The ID of the list
     * @param userId The ID of the user to add
     * @returns Promise resolving to the response data or error
     */
    async addListMember(listId, userId) {
        try {
            const client = this.getClient();
            const result = await client.v2.addListMember(listId, userId);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Remove a member from a list
     * @param listId The ID of the list
     * @param userId The ID of the user to remove
     * @returns Promise resolving to the response data or error
     */
    async removeListMember(listId, userId) {
        try {
            const client = this.getClient();
            const result = await client.v2.removeListMember(listId, userId);
            return result.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
    /**
     * Get lists owned by the authenticated user
     * @returns Promise resolving to an array of lists or error
     */
    async getOwnedLists() {
        try {
            const client = this.getClient();
            const me = await client.v2.me();
            const result = await client.v2.listsOwned(me.data.id);
            return result.data.data;
        }
        catch (error) {
            // @ts-ignore
            return error;
        }
    }
}
//# sourceMappingURL=services.js.map