// Who's invited, one name each, roughly by family. On the RSVP page a guest searches for their name, picks
// it, and can add anyone else they're replying for: everyone sharing a last name with someone picked is
// offered with one tap, and anyone on the list can be searched for. A name ending in " + guest" may
// bring someone; their guest's name is asked for in the RSVP.
//
// Only the server reads this file. The RSVP search sends back a handful of names that match what was
// typed, never the whole list.
export const guests: string[] = [
  // Walters & Merta
  "Mark Walters", "Debra Merta", "Owen Walters", "Drake Walters",
  "Doug Merta", "Monica Merta",
  "Barbara Walters",
  "Denise Hayes", "Lily Hayes", "Rosco Hayes", "Zosha Hayes",
  "Lori Sutton", "Dean Sutton", "Michael Sutton", "Anna Sutton",
  "Lisa Stempien", "Marv Stempien", "Corren Stempien",
  "Theresa Walker", "Kathryn Walker",

  // Walker, Meese & friends
  "Madison Walker", "Stacey Walker",
  "Jeff Meese", "Oliver Meese", "Lorelei Meese",
  "Addilyn Walker", "Steven Walker",
  "Kait Grundy",
  "Sunny Kim",
  "Grace Wittrock",
  "Olivia Robinson",
  "Steven Shimko",
  "Nick Guillemette", "Cindy Guillemette", "Bill Guillemette",
  "David Plait", "Kim Plait", "Ricky Plait", "Kara Plait", "Trisha Plait",
  "Pat Wright", "Tim Wright", "Tony Wright",
  "Stephanie",

  // Redding
  "Preston Donovan",
  "Michelle Redding", "Brian Redding", "Hunter Redding", "Kelsie Redding", "Avery Redding",
  "Grayson Kelley",
  "Ashley Redding", "Scott Sterling", "Gracie Redding", "Cooper Redding",

  // Hunt, Kurzyniec & Canfield
  "Joyce Hunt", "Jerry Hunt",
  "Joan Hunt",
  "Cathy Kurzyniec", "Pete Kurzyniec", "Katelyn Kurzyniec + guest", "Rebecca Kurzyniec", "Alexis Kurzyniec",
  "Ava Kurzyniec",
  "Robert Canfield", "Jessica Canfield",
  "Riley Canfield + guest",
  "Candace Meese",
  "Olivia Swickard",
  "Heidi Trumph", "Matt Trumph",

  // Family and friends
  "Aunt Renee",
  "Uncle Brian",
  "Aunt Michelle",
  "Uncle Darrin",
  "Noah Samuels",
  "Tara Nalepka",
  "Emily Schmidt",
  "Dakota",
  "Kaylee Fields",
  "Thomas",
  "Kayla Pendley + guest",
  "Victoria Giardina",
  "Gary + guest",
  "Julie Paquette",
  "Nicole Laruwe", "Justin Laruwe",
  "Kyle Zambon", "Derek Zambon",
  "Julie Breslawski + guest",
  "Jennifer Ollar + guest",

  // Dumouchelle, Maulbetsch & Roush
  "Bob Dumouchelle", "Lisa Dumouchelle", "Danny Dumouchelle + guest", "Alex Dumouchelle", "Amanda Dumouchelle", "Noah",
  "Courtney Dumouchelle", "Will Dumouchelle + guest",
  "Sara Maulbetsch", "Andy Maulbetsch", "Tiffani Maulbetsch", "Kayci Maulbetsch",
  "Dan Roush", "Angie Roush", "Jake Roush", "Madison Roush",
  "Brennen O’Neil",
  "Addilyn Slutor",
  "Ivan Homestead + guest",
  "Jamie Hazelton",
  "Chris Evzonas",

  // Sack, Santoni, Allevato, Duchi & Shebowich
  "Emory Sack", "Lila Sack",
  "Jennifer Santoni", "Vinnie Santoni", "Olivia Santoni", "Christopher Santoni", "Dominic Santoni",
  "Dave Allevato", "Belinda Allevato", "Phil Allevato",
  "Connie Wilkins",
  "Sharon Duchi", "Tony Duchi", "Justin Duchi", "Anna Duchi",
  "Chris Stempien", "Mitchell Stempien + guest",
  "Lynne Shebowich", "Joel Shebowich", "Michelle Shebowich + guest", "Karen Shebowich", "Michael Shebowich",
  "Tammy Figurski",
];
