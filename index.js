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

// add role function

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

// add employee function

async function promptEmployeeDetails() {
  const [manager] = await pool.query('SELECT * FROM employee WHERE manager_id IS NOT NULL');
  const [role] = await pool.query('SELECT id, title FROM role')
  const roleChoices = role.map(role => ({ name: `${role.title}`, value: role.id }));
  const managerChoices = manager.map(role => ({name: `${role.first_name} ${role.last_name}`,value: role.id }));

  return inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "Enter the employee's first name:",
    },
    {
      type: "input",
      name: "last_name",
      message: "Enter the employee's last name:",
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the employee's role:",
      choices: roleChoices,
    },
    {
      type: "list",
      name: "manager_id",
      message: "Enter the employee's manager:",
      choices: managerChoices, 
    },
  ]);
}

async function addEmployee() {
  const employeeDetails = await promptEmployeeDetails();

  const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
  const values = [
    employeeDetails.first_name,
    employeeDetails.last_name,
    employeeDetails.role_id,
    employeeDetails.manager_id,
  ];

  
    await pool.query(sql, values);
    console.log('Employee added to the database.');
  
  init();
}
//end

// update employee function

async function updateEmployeeRole() {
  const [employees] = await pool.query('SELECT id, first_name, last_name FROM employee');
  const employeeChoices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));

  const [roles] = await pool.query('SELECT id, title FROM role');
  const roleChoices = roles.map(role => ({ name: `${role.title}`, value: role.id }));

  const employeeSelection = await inquirer.prompt([
    {
      type: "list",
      name: "employee_id",
      message: "Select an employee to update:",
      choices: employeeChoices,
    },
    {
      type: "list",
      name: "role_id",
      message: "Select the employee's new role:",
      choices: roleChoices,
    },
  ]);

  const updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
  const updateValues = [employeeSelection.role_id, employeeSelection.employee_id];

  try {
    await pool.query(updateQuery, updateValues);
    console.log('Employee role updated successfully.');
  } catch (error) {
    console.error('Error updating employee role:', error.message);
  }

  init();
}
//end

init();