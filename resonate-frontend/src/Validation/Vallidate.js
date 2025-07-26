export const validateTargetDate = (target_date) => {
    const currDate = new Date()
    currDate.setHours(0, 0, 0, 0)
    const getTargetDate = new Date(target_date)
    if (getTargetDate < currDate) {
        return false;
    }
    return true
}