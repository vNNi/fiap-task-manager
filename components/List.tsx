
import moment from 'moment'
import type { NextPage } from 'next'
import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import task from '../pages/api/task'
import { executeRequest } from '../services/api'
import { Task } from '../types/Task'
import Item from './Item'

type ListProps = {
  tasks: Task[],
  getFilteredList() : void
}

const List: NextPage<ListProps> = ({ tasks, getFilteredList }) => {

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [msgErro, setMsgErro] = useState('');
  const [_id, setId] = useState<string | undefined>('');
  const [name, setName] = useState('');
  const [finishPrevisionDate, setFinishPrevisionDate] = useState('');
  const [finishDate, setFinishDate] = useState('');

  const doUpdate = async (e : any) =>{
    try{
      setLoading(true);
      e.preventDefault();
      
      if(!_id || !name || !finishPrevisionDate){
        setMsgErro('Favor preencher id, nome e data de previsão');
        setLoading(false);
        return;
      }

      const body = {
        name,
        finishPrevisionDate,
        finishDate
      }

      await executeRequest('task?id='+_id, 'PUT', body);
      await getFilteredList();
      closeModal();
    }catch(e : any){
      console.log(e);
      if(e?.response?.data?.error){
        setMsgErro(e?.response?.data?.error);
      }else{
        setMsgErro('Ocorreu erro ao alterar tarefa tente novamente!');
      }
    }

    setLoading(false);
  }

  const doDelete = async (e : any) =>{
    try{
      setLoading(true);
      e.preventDefault();
      
      if(!_id){
        setMsgErro('Favor preencher id para deletar');
        setLoading(false);
        return;
      }

      await executeRequest('task?id='+_id, 'DELETE');
      await getFilteredList();
      closeModal();
    }catch(e : any){
      console.log(e);
      if(e?.response?.data?.error){
        setMsgErro(e?.response?.data?.error);
      }else{
        setMsgErro('Ocorreu erro ao deletar tarefa tente novamente!');
      }
    }

    setLoading(false);
  }

  const closeModal = () => {
    setName('');
    setFinishPrevisionDate('');
    setFinishDate('');
    setId('');
    setLoading(false);
    setMsgErro('');
    setShowModal(false);
  }

  const selectTaskToEdit = (t : Task) => {
    setId(t._id);
    setName(t.name);
    setFinishPrevisionDate(moment(t.finishPrevisionDate).format('yyyy-MM-DD'));
    setFinishDate(t.finishDate ? moment(t.finishDate).format('yyyy-MM-DD') : '');
    setShowModal(true);
    setMsgErro('');
  }

  return (
    <>
      <div className={"container-listagem" + (tasks && tasks.length === 0 ? " vazia" : "")}>

        {
          tasks && tasks.length > 0 ?
            tasks.map(t => <Item task={t} key={t._id} selectTaskToEdit={selectTaskToEdit} />)
            :
            <>
              <img src="/empty-list.svg" alt="Nenhuma tarefa encontrada" />
              <p>Você ainda não possui tarefas cadastradas!</p>
            </>
        }
      </div>
      <Modal show={showModal}
        onHide={() => closeModal()}
        className="container-modal">
          <Modal.Body>
              <p>Alterar uma tarefa</p>
              {msgErro && <p className="error">{msgErro}</p>}
              <input type="text"
                placeholder="Nome da tarefa"
                value={name}
                onChange={e => setName(e.target.value)}/>
              <input type={finishPrevisionDate ? "date" :"text" }
                placeholder="Data de previsão de conclusão"
                value={finishPrevisionDate}
                onChange={e => setFinishPrevisionDate(e.target.value)}
                onFocus={e => e.target.type = "date"}
                onBlur={e => finishPrevisionDate ? e.target.type = "date" : e.target.type = "text" }/>
              <input type={finishDate ? "date" :"text" }
                placeholder="Data de conclusão"
                value={finishDate}
                onChange={e => setFinishDate(e.target.value)}
                onFocus={e => e.target.type = "date"}
                onBlur={e => finishDate ? e.target.type = "date" : e.target.type = "text" }/>
          </Modal.Body>
          <Modal.Footer>
              <div className="button col-12">
                  <button
                    onClick={doUpdate}
                    disabled={isLoading}
                    >{isLoading ? "...Enviando dados" : "Salvar alterações"}</button>
                  <span onClick={doDelete}>Excluir Tarefa</span>
              </div>
          </Modal.Footer>
      </Modal>
    </>
  )
}

export default List;
