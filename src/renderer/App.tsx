import './App.scss';
import Styles from 'styled-components';
import { useState } from "react";
const lists = Array(10).fill(0).map((_, i) => i+1);
const Row = Styles.ul`
`
const Input = Styles.input`
  height: 30px;
  border-radius: 4px;
  padding: 4px;
  margin-right: 4px;
  border: 1px solid rgba(0, 0, 0, .87);
  outline:none;
`
const Button = Styles.button`
  border:none;
  outline:none;background:#1976d2;
  color: #fff;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  &.Stop {
    background:red;
  }
`
const Col = Styles.li`
  display: flex;
  margin-bottom:2px;
  justify-content: center;
`
export default function App() {
  const [start, setState] = useState<boolean>(false);
  const handleValue = (value:string, index:number) => {
    window.electron.ipcRenderer.sendMessage('ipc-messages', [value, index]);
  }
  const handleStart = () => {
    const status = !start;
    setState(status);
    window.electron.ipcRenderer.sendMessage('ipc-start', [status]);
  }
  const handleCopy = (index:number)=> {
    window.electron.ipcRenderer.sendMessage('ipc-copy', [index]);
  }
  return (
    <main>
      <Row>
        {
          lists.map((item) => {
            if (item === 10) {item = 0}
            return (
                <Col key={item}>
                  <Input onChange={({target: {value}}: {target: {value: string}})=> handleValue(value, item)}/>
                  <Button theme='solid' type='secondary' onClick={()=>handleCopy(item)}>Ctrl + {item} Copy</Button>
                </Col>
            );
          })
        }
      </Row>
      <Button onClick={handleStart} className={[start ? "Stop": "Start"]}>{start ? "Stop": "Start"}</Button>
    </main>
  );
}
