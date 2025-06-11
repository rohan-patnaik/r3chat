export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return "Just now";
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    
    // Less than 7 days
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
    
    // More than 7 days, show actual date
    return date.toLocaleDateString();
  }
  
  export function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  
  export function isYesterday(dateString: string): boolean {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }
  
  export function groupConversationsByDate(conversations: Array<{ created_at: string }>) {
    const groups: { [key: string]: Array<any> } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };
  
    conversations.forEach((conversation) => {
      if (isToday(conversation.created_at)) {
        groups.today.push(conversation);
      } else if (isYesterday(conversation.created_at)) {
        groups.yesterday.push(conversation);
      } else {
        const date = new Date(conversation.created_at);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays <= 7) {
          groups.thisWeek.push(conversation);
        } else {
          groups.older.push(conversation);
        }
      }
    });
  
    return groups;
  }