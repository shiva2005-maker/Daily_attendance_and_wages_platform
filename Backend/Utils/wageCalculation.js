const calculateAttendanceEarnings = (attendanceRecords, defaultDailyWage = 0) => {
    const totals = {
        presentDays: 0,
        halfDays: 0,
        absentDays: 0,
        presentEarnings: 0,
        halfDayEarnings: 0,
        totalEarned: 0
    };

    attendanceRecords.forEach((attendance) => {
        const wageValue =
            attendance.wageAtDate ??
            attendance.workerId?.dailyWage ??
            defaultDailyWage;
        const dailyWage = Number(wageValue || 0);

        if (attendance.status === "Present") {
            totals.presentDays++;
            totals.presentEarnings += dailyWage;
        } else if (attendance.status === "Half-Day") {
            totals.halfDays++;
            totals.halfDayEarnings += dailyWage * 0.5;
        } else if (attendance.status === "Absent") {
            totals.absentDays++;
        }
    });

    totals.totalEarned =
        totals.presentEarnings + totals.halfDayEarnings;

    return totals;
};

module.exports = {
    calculateAttendanceEarnings
};