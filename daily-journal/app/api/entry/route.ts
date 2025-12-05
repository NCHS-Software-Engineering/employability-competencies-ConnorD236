import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader } from "mysql2/promise";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import connection from "@/app/lib/db";

// This function runs whenever a POST request is made to /api/entry
export async function POST(req: Request) {
    try {
        // Get the session information and check that the session is valid with a user email
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401})
        }

        /* 
        Get the text and competency IDs of the request body
        We expect a JSON object that looks like this:
            {
                "text": "My thought here",
                "competencyIDs": [1, 3, 5]
            }
        */
        const {text, competencyIDs} = await req.json();

        /* 
        Insert our thought into the Entry table
        connection.execute will return a tuple [rows, fields]
        With a SELECT query, rows will contain the data
        For other queries, rows will contain metadata about the operation
        The ResultSetHeader type allows us to use that metadata, which looks like the following:
            interface ResultSetHeader {
                fieldCount: number;
                affectedRows: number;  
                insertId: number;      
                info: string;
                serverStatus: number;
                warningStatus: number;
            }

        We want to know the insertID since that will be the ID from the new Entry we need for the EntryCompetency table
        You would use the RowDataPacket type to get this same information from a SELECT query

        The query uses a prepared statement (the ?s) to prevent SQL injection attempts
        session.user.email, text replace the ?s in the final executed query
        
        The entryID is stored for use in the EntryCompetency table
        */
        const [entryResult] = await connection.execute<ResultSetHeader>(
            "INSERT INTO Entry (user, text) VALUES (?, ?)",
            [session.user.email, text]
        );
        const entryID = entryResult.insertId;

        // Insert competency/entry relationships into the EntryCompetency table
        // Use a for loop to insert each competency ID into this table along with the new entry ID
        for (const compID of competencyIDs) {
            await connection.execute(
                "INSERT INTO EntryCompetency (entryID, competencyID) VALUES (?, ?)"
            , [entryID, compID]
            );
        }

        // Return the response as a JSON object
        return NextResponse.json({
            id: entryID,
            text,
            createdAt: new Date().toISOString(),
            competencies: competencyIDs
        });
    }
    // Record any errors to the server logs
    // console.error and console.log are not viewable on the client side
    catch (err) {
        console.error("Entry POST error: ", err);
        return NextResponse.json({error: "Failed to add the entry."}, {status: 500})
    }
}

// This function runs whenever a GET request is made to /api/entry
// A GET request is the default request type for the fetch function
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json([], {status: 200});
    }

    const userEmail = session.user.email;
    // The ` is used to allow the query to span multiple lines to improve readability
    // We are using a SELECT query to retrieve all of the entries for the given user
    // The e.id, e.text, and e.createdAt selects those fields from the Entry table (e is the alias given to Entry in the FROM clause)
    // GROUP_CONCAT(c.skill) AS skills concatenates ALL of the skill values connected to each Entry
    // JSON_ARRAYAGG(c.id) AS competencies aggregates multiple values into a JSON array ie [1, 3, 6]
    // The first LEFT JOIN connects each Entry to its associated Competencies
    // The second LEFT JOIN is necessary for an Entry with no Competencies attached
    // The GROUP BY clause connects the results based on their Entry
    // The ORDER BY clause sorts the results by ID starting with the most recent id
    const [entries] = await connection.execute(`
        SELECT 
            e.id, 
            e.text, 
            e.createdAt, 
            JSON_ARRAYAGG(c.id) AS competencies 
        FROM Entry e
        LEFT JOIN EntryCompetency ec ON e.id = ec.entryID 
        LEFT JOIN Competency c ON ec.competencyID = c.id 
        WHERE e.user = ? 
        GROUP BY e.id 
        ORDER BY e.id DESC
    `
        , [userEmail]);
    return NextResponse.json(entries);
}