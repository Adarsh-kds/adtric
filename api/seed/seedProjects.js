require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Project = require("../models/Project");
const makeSlug = require("../utils/makeSlug");
const { uploadFile } = require("../utils/r2");

const projects = [
  {
    name: "Palm Crest Residences",
    image: "palm-crest-residences",
    location: "Gurugram",
    propertyType: "Apartment",
    status: "Under Construction",
    startingPrice: 38500000,
    configuration: "3 and 4 BHK",
    shortDescription:
      "Sky residences on Golf Course Road with private lounges, a rooftop infinity pool and panoramic views of the Aravallis.",
    featured: true,
  },
  {
    name: "The Orchid Villas",
    image: "the-orchid-villas",
    location: "Gurugram",
    propertyType: "Villa",
    status: "Upcoming",
    startingPrice: 65000000,
    configuration: "4 and 5 BHK Villas",
    shortDescription:
      "Gated villa enclave on Sohna Road with private gardens, a clubhouse and 70 percent open green spaces.",
    featured: true,
  },
  {
    name: "Skyline Business Tower",
    image: "skyline-business-tower",
    location: "Mumbai",
    propertyType: "Commercial",
    status: "Ready",
    startingPrice: 19000000,
    configuration: "Office suites 1,200 to 5,000 sq ft",
    shortDescription:
      "Grade A office tower in Bandra Kurla Complex with high-speed lifts, a food court and direct metro access.",
    featured: true,
  },
  {
    name: "Azure Bay Towers",
    image: "azure-bay-towers",
    location: "Mumbai",
    propertyType: "Apartment",
    status: "Under Construction",
    startingPrice: 72500000,
    configuration: "3, 4 and 5 BHK sea-view homes",
    shortDescription:
      "Ultra-luxury sea-facing towers in Worli with concierge service, a spa and a private residents' promenade.",
    featured: true,
  },
  {
    name: "Emerald Hills Estate",
    image: "emerald-hills-estate",
    location: "Bengaluru",
    propertyType: "Villa",
    status: "Ready",
    startingPrice: 49000000,
    configuration: "4 BHK Villas",
    shortDescription:
      "Ready-to-move villas in Whitefield set in landscaped hills, with a golf putting green and a wellness centre.",
    featured: false,
  },
  {
    name: "Meridian Park Residences",
    image: "meridian-park-residences",
    location: "Pune",
    propertyType: "Apartment",
    status: "Ready",
    startingPrice: 11500000,
    configuration: "2 and 3 BHK",
    shortDescription:
      "Well-planned homes in Hinjewadi close to the IT parks, with a central park, a school and a shopping arcade.",
    featured: false,
  },
  {
    name: "Royal Gardens Jubilee",
    image: "royal-gardens-jubilee",
    location: "Hyderabad",
    propertyType: "Apartment",
    status: "Upcoming",
    startingPrice: 31000000,
    configuration: "3 and 4 BHK",
    shortDescription:
      "Premium residences in Jubilee Hills with large balconies, a club with an indoor pool and 24 hour security.",
    featured: false,
  },
  {
    name: "The Capital Square",
    image: "the-capital-square",
    location: "Noida",
    propertyType: "Commercial",
    status: "Under Construction",
    startingPrice: 8500000,
    configuration: "Retail shops and office spaces",
    shortDescription:
      "A modern retail and office address in Sector 62 with ample parking and strong footfall near the metro.",
    featured: false,
  },
];

const uploadImage = async (imageName, number) => {
  const fileName = `${imageName}-${number}.jpg`;
  const filePath = path.join(__dirname, "images", fileName);
  const buffer = fs.readFileSync(filePath);
  return uploadFile(buffer, fileName, "image/jpeg", "seed");
};

const run = async () => {
  await connectDB();
  await Project.deleteMany({});

  for (const item of projects) {
    const coverImage = await uploadImage(item.image, 1);
    const gallery = [
      await uploadImage(item.image, 2),
      await uploadImage(item.image, 3),
    ];
    const slug = await makeSlug(item.name);

    await Project.create({
      name: item.name,
      slug,
      location: item.location,
      propertyType: item.propertyType,
      status: item.status,
      startingPrice: item.startingPrice,
      configuration: item.configuration,
      shortDescription: item.shortDescription,
      coverImage,
      gallery,
      featured: item.featured,
      published: true,
    });
    console.log(`Created: ${item.name}`);
  }

  console.log(`Done. ${projects.length} projects seeded.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
