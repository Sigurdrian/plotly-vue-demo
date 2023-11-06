// Define an interface for the Mentions object where the keys are dates and the values are numbers
interface Mentions {
    [key: string]: number;
  }
  
  // Define an interface for the entire structure that includes topic, topicID, and mentions
  interface TopicData {
    topic: string;
    topicID: string;
    mentions: Mentions;
  }  