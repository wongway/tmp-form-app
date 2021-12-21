const timeAgoString = (timestamp) => {
    const delta = Date.now() - new Date(timestamp);

    // console.log(Date.now(), delta, delta_min);//, delta_hr, delta_days, delta_months, delta_years);

    const delta_min = Math.floor(delta / (1000 * 60));
    if (delta_min < 60) {
        return `${delta_min} min`
    }

    const delta_hr = Math.floor(delta_min / 60);
    if (delta_hr < 24) {
        return `${delta_hr} hrs`
    }

    const delta_days = Math.floor(delta_hr / 24);    
    if (delta_days < 30) {
        return `${delta_days} days`
    }

    const delta_months = Math.floor(delta_days / 30);    
    if (delta_months < 12) {
        return `${delta_months} mth`
    }

    const delta_years = Math.floor(delta_months / 12);    
    return `${delta_years} yrs`
}

export { timeAgoString };