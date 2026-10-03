const test = require("node:test");
const assert = require("node:assert/strict");

const {
    calculateAttendanceEarnings
} = require("../Utils/wageCalculation");

test("uses attendance wage snapshots for earnings", () => {
    const totals = calculateAttendanceEarnings([
        { status: "Present", wageAtDate: 1000 },
        { status: "Half-Day", wageAtDate: 900 },
        { status: "Absent", wageAtDate: 1000 }
    ], 500);

    assert.deepEqual(totals, {
        presentDays: 1,
        halfDays: 1,
        absentDays: 1,
        presentEarnings: 1000,
        halfDayEarnings: 450,
        totalEarned: 1450
    });
});

test("falls back to the worker or default wage for legacy records", () => {
    const totals = calculateAttendanceEarnings([
        { status: "Present", workerId: { dailyWage: 800 } },
        { status: "Half-Day" }
    ], 600);

    assert.equal(totals.presentEarnings, 800);
    assert.equal(totals.halfDayEarnings, 300);
    assert.equal(totals.totalEarned, 1100);
});