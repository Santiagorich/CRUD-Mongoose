import {useState,useEffect} from 'react';
import { Container, Form, Button } from 'semantic-ui-react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import { DataGrid } from '@mui/x-data-grid';


function App() {
  const [users, setUsers] = useState([]);
  const getUsers = async () => {
    console.log('Getting users')
    let resp = await fetch('http://localhost:5000/users').then(res => res.json()).then(data => {
      console.log(data);
      return data
    }
    ).catch(err => {
      console.log(err);
    });
    setUsers(resp);
  };
  const updateUser = async (id, edits) => {
    console.log('Updating user: ' + id);
    await fetch(`http://localhost:5000/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(edits)
    }).catch(err => {
      console.log(err);
    }
    );
  }

  const deleteUser = async (id) => {
    console.log('Deleting user: ' + id);
    await fetch(`http://localhost:5000/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log(err);
    }

    );
    await getUsers();
  }

 

  useEffect(() => {
    fetch('http://localhost:5000/users').then(res => res.json()).then(data => {
      setUsers(data);
    }
    ).catch(err => {
      console.log(err);
    });
  }, [])

  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70,flex:1},
    { field: 'name', headerName: 'Name', width: 70,flex:1,editable: true},
    { field: 'email', headerName: 'Email', width: 130,flex:1,editable: true},
    { field: 'password', headerName: 'Password', width: 130,flex:1,editable: true},
    { field: 'createdAt', headerName: 'Date', width: 130,flex:1},
  ];



  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      repeatPassword: ''
    },
    onSubmit: async values => {
      console.log(values);
      await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password
        })
      })
      await getUsers()
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string()
        //.email('Email is invalid')
        .required('Email is required'),
      password: Yup.string()
        //.min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
        repeatPassword: Yup.string()
        .required('Repeating the password is required')
        //.oneOf([Yup.ref('password'), null], 'Passwords must match')

    })

    
  });
  return (
    <div style={{display:'flex',flexDirection:'column', alignItems:'center', gap:'5em',padding:'3em'}}>
      <h1>The Soup</h1>
      <Container>
      <Form onSubmit={formik.handleSubmit}>
        <Form.Input type='text' placeholder="Nombre y apellido" name='name' error={formik.errors.name} onChange={formik.handleChange}/>
        <Form.Input type='text' placeholder="Email" name='email' error={formik.errors.email} onChange={formik.handleChange}/>
        <Form.Input type='password' placeholder="Contraseña" name='password' error={formik.errors.password} onChange={formik.handleChange}/>
        <Form.Input type='password' placeholder="Confirmar contraseña" name='repeatPassword' error={formik.errors.repeatPassword} onChange={formik.handleChange} />
        <Button type='submit'>Enviar</Button>
      </Form>
    </Container>

    {users.length > 0 && 
    <div style={{display:'flex' ,flexDirection:'column', width:'100%',alignItems:'center',justifyContent:'center',gap:'1em'}}>
      
      <div style={{height:400,width:'100%'}}>
            
    <DataGrid
    getRowId={(row) => row._id}
  rows={users}
  columns={columns}
  pageSize={5}
  rowsPerPageOptions={[5]}
  checkboxSelection
  disableSelectionOnClick
  onSelectionModelChange={(ids) => {
    const selectedIDs = new Set(ids);
    setSelectedRows( users.filter((row) =>
      selectedIDs.has(row._id.toString())
    ));
  }}
  onCellEditCommit={async ({id, field, value}) => {
    console.log('Editing row: ' + id + ' field: ' + field + ' value: ' + value);
    let edits = {};
    edits[field] = value;
    await updateUser(id, edits);
    await getUsers();
  }
  }
/>
    </div>
    {selectedRows.length > 0 &&
    <Button onClick={() => {
      for(let user of selectedRows){
      deleteUser(user._id);
      }
    }
    }>Eliminar</Button>}
    </div>
}

    </div>
  );
}

export default App;
