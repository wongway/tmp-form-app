const timeAgoString = (timestamp) => {
    const delta = Date.now() - new Date(timestamp);

    // console.log(Date.now(), delta, delta_min);//, delta_hr, delta_days, delta_months, delta_years);

    const delta_sec = Math.floor(delta / 1000); 
    if (delta_sec < 60) {
        if (delta_sec == 1) {
            return '1 sec'
        }
        return `${delta_sec} secs`
    }

    const delta_min = Math.floor(delta_sec / 60);
    if (delta_min < 60) {
        if (delta_min == 1) {
            return '1 min'
        }
        return `${delta_min} mins`
    }

    const delta_hr = Math.floor(delta_min / 60);
    if (delta_hr < 24) {
        if (delta_hr == 1) {
            return '1 hr'
        }
        return `${delta_hr} hrs`
    }

    const delta_days = Math.floor(delta_hr / 24);    
    if (delta_days < 30) {
        if (delta_days == 1) {
            return '1 day'
        }
        return `${delta_days} days`
    }

    const delta_months = Math.floor(delta_days / 30);    
    if (delta_months < 12) {
        if (delta_months == 1) {
            return '1 mth'
        }
        return `${delta_months} mths`
    }

    const delta_years = Math.floor(delta_months / 12);    
    if (delta_years == 1) {
        return '1 yr'
    }
    return `${delta_years} yrs`
}

export { timeAgoString };