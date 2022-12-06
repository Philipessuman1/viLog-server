const pool = require( '../db').pool;
import {Response} from 'express';
import dotenv from 'dotenv';
dotenv.config();


export const addHost = async (body: { host_name: string; department: string; email: string; phone: any; }) => {
    try {
        pool.query(
        `INSERT INTO hosts (host_name, department, email, phone)
        VALUES ($1, $2, $3, $4)`, [body.host_name, body.department, body.email, body.phone]
    )
     console.log("Added new employee");
    } catch(err) {
        console.log(err);
    }
}

export const modifyHost = async (req: { params: { id: number; }; body: { host_name: string; department: string; email: string; phone: any; }; }, res: Response) => {
    const id:number = req.params.id;
    const { host_name, department, email, phone} = req.body
    try {
        pool.query(
            `UPDATE hosts
         SET host_name = $1, department = $2, email = $3, phone = $4
         WHERE id = $5;
        `, [host_name, department, email, phone, id]
        );
        res.status(200).send(`Employee with ID:${id} updated`);
    } catch (err) {
        throw { status: 500, message: err };
    }
};

export const updateVisitorsforDelete = async (body: { id: number; }) => {
    try {
        pool.query(
            `UPDATE visitors
         SET host_id = null
         WHERE host_id = $1;
        `, [body.id]
        );
        return console.log("Visitors updated");
    } catch (err) {
        throw { status: 500, message: err };
    }
};

export const deleteHost = async (body: { id: number; }) => { 
    try {
        pool.query(
            `DELETE FROM hosts
         WHERE id = $1
        `, [body.id]
        );
        console.log("Host deleted");
    } catch (err) {
        throw { status: 500, message: err };
    }
};

export const getAllEmployees = async () => {
    return pool.query(
        'SELECT * FROM hosts'
    )
    .then((res: { rows: any; }) => {
        return res.rows
    })
    .catch((err: { status: any; message: any; }) => {
        throw {status: err?.status || 500, message: err.message}
    })
};

export const getVisitors = async () => {
    return pool.query(
       'SELECT * FROM visitors'
    )
    .then((res: { rows: any; }) => {
        return res.rows
    })
    .catch((err: { status: any; message: any; }) => {
        throw {status: err?.status || 500, message: err.message}
    })
};

export const getDailyVisits = async () => {
    return pool.query(
        `SELECT date, count(*) FROM visitors
        WHERE date > current_date - interval '30' day
        GROUP BY date
        ORDER BY date asc`
    )
    .then((res: { rows: any; }) => {
        return res.rows
    })
    .catch((err: { status: any; message: any; }) => {
        throw {status: err?.status || 500, message: err.message}
    })
};

/*export const getBusiestHosts = async () => {
    return pool.query(
        `SELECT hosts.host_name, count(visitors.host_id)
         FROM hosts
         JOIN visitors
         ON hosts.id = visitors.host_id
         WHERE date > current_date - interval '90' day
         GROUP BY 1, 2`
    )
    .then((res: { rows: any; }) => {
        return res.rows
    })
    .catch((err: { status: any; message: any; }) => {
        throw {status: err?.status || 500, message: err.message}
    })
};*/