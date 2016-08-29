module.exports = {
    GET_TP_NO_BY_FIRST_NAME: "SELECT * FROM PEOPLE WHERE FIRST_NAME like ?",
    GET_TP_NO_BY_LAST_NAME: "SELECT * FROM PEOPLE WHERE LAST_NAME like ?",
    GET_TP_NO_BY_FULL_NAME: "SELECT * FROM PEOPLE WHERE FIRST_NAME like ? AND LAST_NAME like ?",
    GET_ALL_TP_NOS: "SELECT * FROM PEOPLE",

    GET_TP_NO_BY_STATE: "SELECT * FROM PEOPLE WHERE STATE=? AND ID IN(?)",
    GET_TP_NO_BY_DEPARTMENT_AND_IDS: "SELECT * FROM PEOPLE WHERE DEPARTMENT=? AND ID IN(?) ",


    GET_TP_NO_BY_DEPARTMENT: "SELECT * FROM DEPARTMENTS WHERE NAME=?",
    GET_TP_NO_BY_DEPARTMENT_AND_STATE: "SELECT * FROM DEPARTMENTS WHERE NAME=? AND STATE=?",

    GET_FLAG_BY_NAME: "SELECT * FROM FLAGS WHERE NAME=?",
    SET_FLAG_BY_NAME: "UPDATE FLAGS SET VALUE=?, TEXT=? WHERE NAME=?"
}



