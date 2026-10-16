// Who's invited, one name each, roughly by family. On the RSVP page a guest searches for their name, picks
// it, and can add anyone else they're replying for: everyone sharing a last name with someone picked is
// offered with one tap, and anyone on the list can be searched for. A name ending in " + guest" may
// bring someone, and " + 2 guests" two; their guests' names are asked for in the RSVP.
//
// Only the server reads this file. The RSVP search sends back a handful of names that match what was
// typed, never the whole list.
export const guests: string[] = [
  // Walters & Merta
  "Mark Walters", "Debbie Walters", "Owen Walters", "Drake Walters",
  "Doug Merta", "Monika Merta",
  "Barbara Walters",
  "Denise Hayes", "Lily Hayes + guest", "Rosco Hayes", "Zosha Hayes",
  "Lori Sutton", "Dean Sutton", "Michael Sutton", "Madeline Templeton",
  "Anna Sutton", "Brennan Grego", "Timothy Grego",
  "Lisa Stempian", "Marvin Stempien", "Corinne Stempien",

  // Walker, Meese & friends
  "Madison Walker", "Stacey Walker",
  "Jeff Meese", "Oliver Meese", "Lorelei Meese",
  "Addilyn Walker", "Steven F Walker", "Steven A Walker + guest",
  "Kait Grundy", "Kenny Grundy",
  "Sunny Kim",
  "Grace Wittrock",
  "Olivia Robbins", "Kyle Feldman",
  "Emmy Putnam",
  "Alex Brymer + 2 guests", "Rachel Brymer", "Ivy Brymer",
  "Steven Shimko",
  "Nick Guillmette", "Cindy Guillmette", "Bill Guillmette",
  "David Plait", "Kim Plait", "Ricky Plait", "Kara Plait + guest", "Trisha Plait",
  "Pat Wright", "Tim Wright", "Tony Wright",
  "Stephanie Donovan", "Calliegh Donovan",

  // Redding
  "Preston Donovan",
  "Michelle Redding", "Brian Redding", "Hunter Redding", "Kelsey Redding", "Avery Redding",
  "Grayson Kelley",
  "Ashley Redding", "Scott Sterling", "Gracie Redding", "Cooper Redding",

  // Hunt, Kurzyniec & Canfield
  "Joyce Hunt", "Jerry Hunt",
  "Cathy Kurzyniec", "Pete Kurzyniec", "Katelyn Kurzyniec + 2 guests", "Rebecca Kurzyniec", "Alexis Kurzyniec + guest",
  "Ava Kurzyniec",
  "Robert Canfield", "Jessica Canfield",
  "Gavin Canfield",
  "Riley Canfield + guest",
  "Chris Swickard", "Olivia Swickard", "Brianna Swickard",
  "Heidi Trumph", "Matt Trumph",

  // Family and friends
  "Kayla Pendley + guest",

  // Dumouchelle, Maulbetsch & Roush
  "Bob Dumouchelle", "Lisa Dumouchelle", "Danny Dumouchelle", "Ava Lianos", "Alex Dumouchelle", "Amanda Dumouchelle", "Noah Moskal",
  "Courtney Dumouchelle", "Oliver Dumouchelle", "Will Dumouchelle", "Janet Allen",
  "Sara Maulbetsch", "Andy Maulbetsch", "Tiffani Maulbetsch", "Kayci Maulbetsch",
  "Dan Roush", "Angie Roush", "Jake Roush", "Madison Roush",
  "Brennen O’Neil",
  "Addalyn Sluiter",
  "Ivan Olmsted + guest",
  "Jamie Hazelton", "Saba Heravi",
  "Chris Evzonas",

  // Sack, Santoni, Allevato, Duchi & Shebowich
  "Pam Sack", "Pete Sack", "Emory Sack", "Lila Sack",
  "Jennifer Santoni", "Vinnie Santoni", "Olivia Santoni", "Joe Aeschliman", "Christopher Santoni", "Dominic Santoni",
  "Dave Allevato", "Belinda Allevato", "Phil Allevato",
  "Connie Wilkins",
  "Sharon Duchi", "Tony Duchi", "Justin Duchi", "Anna Duchi",
  "Chris Stempien", "Mitchell Stempien + guest", "Claire Stempien", "Christopher Stempien",
  "Lynne Schebowich", "Joel Schebowich", "Michelle Shebowich + guest", "Karen Shebowich", "Michael Shebowich",
  "Tammy Figurski", "Jennifer Everett",
  "Kelli Figurski", "Rob Acuff",
  "Cheryl Figurski Buff", "Ronnie Buff",
];
