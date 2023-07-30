const inquirer = require('inquirer');
const pool = require('./createpool');

const questions = [
  {
    name: "task",
    type: "list",
    message: "Select an inquiry",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role"
    ]
  }
];

async function init() {
  const answers = await inquirer.prompt(questions);
  switch (answers.task) {
    case "View all departments":
      await viewAllDepartments();
      break;

    case "View all roles":
      await viewAllRoles();
      break;

    case "View all employees":
      await viewAllEmployees();
      break;

    case "Add a department":
      await addDepartment();
      break;

    case "Add a role":
      await addRole();
      break;

    case "Add an employee":
      await addEmployee();
      break;

    case "Update an employee role":
      await updateEmployeeRole();
      break;
  }
}

async function viewAllDepartments() {
  const result = await pool.query('SELECT * FROM department');

  console.table(result[0]); 
  init();
}


//end

init();