
export const timeDeltaFormat = (dateTime) => {
    const seconds = (Date.now() - dateTime) / 1000;

    if(seconds < 60) {
        return "seconds ago"
    }

    const minutes = seconds / 60;

    if(minutes < 2) {
       return "a minute ago";
    } else if(Math.round(minutes) < 60) {
        return Math.round(minutes) + " minutes ago";
    }

    const hours = minutes / 60;

    if(hours < 2) {
        return "an hour ago";
    } else if(Math.round(hours) < 24) {
        return Math.round(hours) + " hours ago";
    }

    const days = hours / 24;

    if(days < 2) {
        return "a day ago";
    } else if(Math.round(days) <= 30) {
        return Math.round(days) + " days ago";
    }

    const months = days / 365 * 12;
    
    if (months < 2) {
        return "a month ago";
    } else if(Math.round(months) < 12) {
        return Math.round(months) + " months ago";
    }

    const years = days / 365;

    if (years < 2) {
        return "a year ago";
    } else {
        return Math.round(years) + "years ago";
    }
}