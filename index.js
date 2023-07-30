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

async function viewAllRoles() {
  const sql = `
    SELECT role.id AS role_id, role.title AS job_title, role.salary, department.name AS department_name
    FROM role
    LEFT JOIN department ON role.department_id = department.id
  `;
  const result = await pool.query(sql)
  console.table(result[0]);
  init();
}

async function viewAllEmployees() {
  const sql = `SELECT 
  employee.id AS employee_id,
  employee.first_name,
  employee.last_name,
  role.title AS job_title,
  department.name AS department_name,
  role.salary,
  CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
  FROM employee
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employee AS manager ON employee.manager_id = manager.id
  `;

  const result = await pool.query(sql);
  console.table(result[0]);
  init();
}

async function promptDepartmentName() {
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a name:"
    }
  ]);
}

async function addDepartment() {
  const answers = await promptDepartmentName();
  await pool.query('INSERT INTO department (name) VALUES (?)', [answers.name]);
  console.log('Department added to the database.');
init();
}

//add role function
async function promptRoleDetails() {
  const [departments] = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.map(department => ({ name: department.name }))
  return inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the role name:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the role salary:",
    },
    {
      type: "list",
      name: "department",
      message: "Select a department:",
      choices: departmentChoices
    },
  ]);
}

async function addRole() {
  const roleDetails = await promptRoleDetails();
  const departmentIdQuery = 'SELECT id FROM department WHERE name = ?';
  const [department] = await pool.query(departmentIdQuery, [roleDetails.department]);

  const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
  const values = [roleDetails.name, roleDetails.salary, department[0].id];
  await pool.query(sql, values);

  console.log('Role added to the database.');
  init();
}


//end

init();