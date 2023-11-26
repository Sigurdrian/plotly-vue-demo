// Define an interface for the Mentions object where the keys are dates and the values are numbers
export interface Mentions {
  [key: string]: number;
}

// Define an interface for the entire structure that includes topic, topicID, and mentions
export default interface TopicData {
  topic: string;
  topicID: string;
  mentions: Mentions;
}
