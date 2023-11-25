// Define an interface for the entire structure that includes topic, topicID, and mentions
export default interface BubbleData {
    topic: string;
    size: number;
    short_name: string;
    x: number;
    y: number;
    color: string;
}
