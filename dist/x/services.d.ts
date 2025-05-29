import { ApiRequestError, TweetV2, TweetV2PaginableTimelineResult, TwitterApi, UserV2, ListV2, InlineErrorV2 } from 'twitter-api-v2';
/**
 * Twitter service for interacting with the Twitter API
 */
export declare class TwitterService {
    private static instance;
    private client;
    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor();
    /**
     * Get the singleton instance of TwitterService
     */
    static getInstance(): TwitterService;
    /**
     * Initialize the Twitter client with credentials
     * @returns The initialized Twitter client
     */
    getClient(): TwitterApi;
    /**
     * Get tweets for a specific user
     * @param userId The Twitter user ID
     * @param paginationToken Optional pagination token for fetching next page
     * @returns Promise resolving to user timeline data
     */
    getUserTweets(userId: string, paginationToken?: string, exclude?: ('retweets' | 'replies')[], maxResults?: number): Promise<TweetV2[] | InlineErrorV2[] | ApiRequestError | string>;
    /**
     * Get a single tweet by ID
     * @param tweetId The ID of the tweet to retrieve
     * @returns Promise resolving to the tweet data or null if not found
     */
    getTweet(tweetId: string): Promise<TweetV2 | ApiRequestError>;
    /**
     * Get mentions for a specific user
     * @param userId The Twitter user ID
     * @param paginationToken Optional pagination token for fetching next page
     * @param maxResults Optional parameter to specify the number of results to return (default: 10)
     * @returns Promise resolving to user mention timeline data
     */
    getUserMentionTimeline(userId: string, paginationToken?: string, maxResults?: number): Promise<TweetV2PaginableTimelineResult | ApiRequestError>;
    /**
     * Quote a tweet with a comment
     * @param tweetId The ID of the tweet to quote
     * @param replyText The text to include with the quote
     * @returns Promise resolving to the created quote tweet data or error
     */
    quoteAndComment(tweetId: string, replyText: string): Promise<{
        id: string;
        text: string;
    } | ApiRequestError>;
    /**
     * Reply to a tweet
     * @param tweetId The ID of the tweet to reply to
     * @param replyText The text content of the reply
     * @returns Promise resolving to the created reply tweet data or error
     */
    replyToTweet(tweetId: string, replyText: string): Promise<{
        id: string;
        text: string;
    } | ApiRequestError>;
    /**
     * Post a new tweet, optionally with an image
     * @param text The text content of the tweet
     * @param imageBase64 Optional base64 encoded image to attach to the tweet
     * @returns Promise resolving to the created tweet data or error
     */
    postTweet(text: string, imageBase64?: string): Promise<{
        id: string;
        text: string;
    } | ApiRequestError>;
    /**
     * Like a tweet with the authenticated user
     * @param tweetId The ID of the tweet to like
     * @returns Promise resolving to the like response data or error
     */
    likeTweet(tweetId: string): Promise<{
        liked: boolean;
    } | ApiRequestError>;
    /**
     * Follow a user
     * @param targetUserId The ID of the user to follow
     * @returns Promise resolving to the follow response data or error
     */
    followUser(targetUserId: string): Promise<{
        following: boolean;
        pending_follow: boolean;
    } | ApiRequestError>;
    /**
     * Unfollow a user
     * @param targetUserId The ID of the user to unfollow
     * @returns Promise resolving to the unfollow response data or error
     */
    unfollowUser(targetUserId: string): Promise<{
        following: boolean;
    } | ApiRequestError>;
    /**
     * Get user information by username
     * @param username The Twitter username (without @ symbol)
     * @returns Promise resolving to the user data or error
     */
    getUserByUsername(username: string): Promise<UserV2 | ApiRequestError>;
    /**
     * Search tweets with a query
     * @param query The search query
     * @param maxResults Maximum number of results to return (default: 10)
     * @returns Promise resolving to an array of tweets or error
     */
    searchTweets(query: string, maxResults?: number): Promise<TweetV2[] | ApiRequestError>;
    /**
     * Get trending topics for a specific location
     * @param woeid The "Where On Earth ID" (WOEID) for the location (e.g., 1 for worldwide)
     * @returns Promise resolving to trending topics or error
     */
    getTrendingTopics(woeid?: number): Promise<any | ApiRequestError>;
    /**
     * Create a new list
     * @param name The name of the list
     * @param description Optional description for the list
     * @param isPrivate Whether the list should be private (default: false)
     * @returns Promise resolving to the created list data or error
     */
    createList(name: string, description?: string, isPrivate?: boolean): Promise<ListV2 | ApiRequestError>;
    /**
     * Add a member to a list
     * @param listId The ID of the list
     * @param userId The ID of the user to add
     * @returns Promise resolving to the response data or error
     */
    addListMember(listId: string, userId: string): Promise<{
        is_member: boolean;
    } | ApiRequestError>;
    /**
     * Remove a member from a list
     * @param listId The ID of the list
     * @param userId The ID of the user to remove
     * @returns Promise resolving to the response data or error
     */
    removeListMember(listId: string, userId: string): Promise<{
        is_member: boolean;
    } | ApiRequestError>;
    /**
     * Get lists owned by the authenticated user
     * @returns Promise resolving to an array of lists or error
     */
    getOwnedLists(): Promise<ListV2[] | ApiRequestError>;
}
