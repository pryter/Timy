export const convertTime = (ms: number) => {
    let millis: number, seconds: number, minutes: number, hours: number, days: number, weeks: number
    millis = ms
    seconds = Math.floor((millis / 1000) % 60)
    minutes = Math.floor((millis / (1000 * 60)) % 60)
    hours = Math.floor((millis / (1000 * 60 * 60)) % 24)
    days = Math.floor((millis / (1000 * 60 * 60 * 24)) % 7)
    weeks = Math.floor((millis / (1000 * 60 * 60 * 24 * 7)))
    if (days < 7) {
        return `${days} Day(s) ${hours} Hour(s) ${minutes} Minute(s) ${seconds} Second(s)`
    } else {
        return `${weeks} Week(s) ${days} Day(s) ${hours} Hour(s) ${minutes} Minute(s)`
    }
}