INSERT INTO department (name) VALUES
  ('Adventuring Party'),
  ('Wizards Guild'),
  ('Treasury'),
  ('Bardic College');


INSERT INTO role (title, salary, department_id) VALUES
 ('Party Leader', 60000.00, 1),
  ('Rogue', 40000.00, 1),
  ('Guild Master', 55000.00, 2),
  ('Apprentice Wizard', 35000.00, 2),
  ('Treasury Keeper', 50000.00, 3),
  ('Bardic Performer', 58000.00, 4),
  ('Bardic Historian', 42000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('Gandalf', 'Grey', 1, NULL),
  ('Bilbo', 'Baggins', 2, 1),
  ('Gimli', 'Son of Gloin', 2, 1),
  ('Hermione', 'Granger', 3, NULL),
  ('Luna', 'Lovegood', 3, 4),
  ('Frodo', 'Baggins', 4, 4),
  ('Aragorn', 'Elessar', 5, NULL),
  ('Elrond', 'Half-elven', 6, NULL),
  ('Legolas', 'Greenleaf', 7, 6);