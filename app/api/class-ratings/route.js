import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ClassRating from '@/models/ClassRating';
import { getClientInfo } from '@/lib/clientInfo';

const studentNames = [
  "Abdullah S/o Asad Rasheed",
  "Anas Ahmed S/o Imran Aslam",
  "Syed Ali Baqir S/o Abid Hussain Shah",
  "Moneba Jabeen D/o Basharat Ali",
  "AbdulRaheem Khalid S/o Khalid Mehmood",
  "Muhammad Fahad Ullah S/o Muhammad Aslam",
  "Misbah D/o Muhammad Irfan",
  "Fajar Saleem D/o Muhammad Saleem",
  "Muhammad Khalil S/o Saif ullah",
  "Mehfooz Ahmad S/o Maqsood Ahmad",
  "Hammad Ali S/o Amanat Ali",
  "Mahnoor D/o Ghulam Sarwar",
  "Ahmed Munawar S/o Munawar Hussain",
  "Safia Bibi D/o Dost Muhammad",
  "Muhammad Sohaib Roomi S/o Shahid Mehmood",
  "Zaki ul Rehman S/o Abaid Ul Rehman",
  "Haider Ali S/o Muhammad Asghar",
  "Muhammad Safyan S/o Muhammad Ramzan",
  "Maryam Siddique D/o Muhammad Siddique",
  "Hammad Ali S/o Zulfiqar Ahmed",
  "Muhammad Shan S/o Muhammad Afzal",
  "Abdullah S/o Muhammad Asif",
  "Husnain Haider S/o Haider ALi",
  "Momna D/o Muhammad Boota",
  "Manahil Fatima D/o Shehbaz Ahmed",
  "Maryam D/o Muhhad Akhtar",
  "Muhammad Uzair S/o Javed Iqbal",
  "Muhammad Abdul Aziz Butt S/o Muhammad Idrees Butt",
  "Abdul Rehman Saleem S/o Muhammad Saleem",
  "Abdul Rehman S/o Waheed Ahmad",
  "Muhammad Asim S/o Muhammad Alamghir",
  "Abi Saad S/o Muhammad Shahzad",
  "Irtiza Arifeen S/o Najam Ul Arifeen",
  "Muhammad Muneeb Dodhy S/o Muhammad Javed Dodhy",
  "Muhammad SamiUllah S/o Muhammad Saleem",
  "Furqan Ahmed S/o Zaheer Ahmed",
  "Umair Ali Masood S/o Masood Ahmad",
  "Muskan Bibi D/o Muhammad Aslam"
];

export async function GET(req) {
  try {
    await dbConnect();
    
    // Self-healing roster sync to prevent duplicate documents and enforce exact series order
    const allStudentsInDb = await ClassRating.find();
    const seenNames = new Set();
    
    for (const student of allStudentsInDb) {
      if (seenNames.has(student.targetStudentName)) {
        // Keep the one with actual ratings if possible, or delete duplicate
        const duplicates = allStudentsInDb.filter(s => s.targetStudentName === student.targetStudentName);
        const toKeep = duplicates.reduce((best, cur) => (cur.ratings?.length || 0) > (best.ratings?.length || 0) ? cur : best, duplicates[0]);
        if (student._id.toString() !== toKeep._id.toString()) {
          await ClassRating.deleteOne({ _id: student._id });
        }
      } else {
        seenNames.add(student.targetStudentName);
      }
    }
    
    // Add any missing names from the official list
    const freshDbStudents = await ClassRating.find();
    const existingNames = new Set(freshDbStudents.map(s => s.targetStudentName));
    const missingStudents = studentNames.filter(name => !existingNames.has(name));
    
    if (missingStudents.length > 0) {
      const seedOps = missingStudents.map(name => ({
        targetStudentName: name,
        ratings: []
      }));
      await ClassRating.insertMany(seedOps);
    }
    
    // Fetch clean list
    const finalStudents = await ClassRating.find().lean();

    const formattedRatings = finalStudents.map(student => {
      const ratingArray = student.ratings || [];
      const totalScore = ratingArray.reduce((sum, r) => sum + r.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length) : 0;
      
      const breakdown = { 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingArray.forEach(r => {
        if (r.score >= 1 && r.score <= 7) {
          breakdown[r.score]++;
        }
      });

      const reviews = ratingArray.map(r => ({
        score: r.score,
        alias: r.alias || 'Anonymous',
        comment: r.comment || '',
        createdAt: r.createdAt || new Date()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        _id: student._id,
        targetStudentName: student.targetStudentName,
        score: avgScore,
        count: ratingArray.length,
        breakdown,
        reviews
      };
    });

    // Sort according to the exact index order in the official studentNames array
    formattedRatings.sort((a, b) => {
      const idxA = studentNames.indexOf(a.targetStudentName);
      const idxB = studentNames.indexOf(b.targetStudentName);
      return idxA - idxB;
    });

    return NextResponse.json(formattedRatings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { targetStudentName, score, alias, comment } = await req.json();
    
    if (!targetStudentName || !score || score < 1 || score > 7) {
      return NextResponse.json({ error: 'Score must be a number between 1 and 7.' }, { status: 400 });
    }

    const clientInfo = getClientInfo(req);
    await dbConnect();

    let student = await ClassRating.findOne({ targetStudentName });
    
    if (!student) {
      student = new ClassRating({ targetStudentName, ratings: [] });
    }

    const ratingIndex = student.ratings.findIndex(r => r.deviceFingerprint?.ip === clientInfo.ip);
    const newRating = {
      score: Number(score),
      alias: alias || 'Anonymous',
      comment: comment || '',
      createdAt: new Date(),
      deviceFingerprint: {
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        browser: clientInfo.browser,
        os: clientInfo.os
      }
    };

    if (ratingIndex > -1) {
      // Update existing rating
      student.ratings[ratingIndex] = newRating;
    } else {
      // Add new rating
      student.ratings.push(newRating);
    }

    await student.save();

    return NextResponse.json({ message: 'Rating secured successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
