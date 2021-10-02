import type { NextPage } from 'next'
import { useState } from 'react'

type FilterProps = {
 periodoDe : string, 
 setPeriodoDe(s : string) : void,
 periodoAte : string, 
 setPeriodoAte(s : string) : void,
 status : number, 
 setStatus(n : number) : void,
}

const Filters: NextPage<FilterProps> = ({ 
  periodoDe,
  periodoAte,
  status,
  setPeriodoDe,
  setPeriodoAte,
  setStatus
}) => {

  const [showFilters, setShowFilter] = useState(false);

  return (
    <div className="container-filtros">
      <div className="title">
        <span>Tarefas</span>
        <img src="/filtro.svg" alt="Filtrar tarefas" onClick={e => setShowFilter(!showFilters)} />
        <div className="form">
          <div>
            <label>Data prevista de conclusão de:</label>
            <input type="date" value={periodoDe} onChange={e => setPeriodoDe(e.target.value)} />
          </div>
          <div>
            <label> até:</label>
            <input type="date" value={periodoAte} onChange={e => setPeriodoAte(e.target.value)} />
          </div>
          <div className="line"/>
          <div>
            <label>Status:</label>
            <select value={status} onChange={e => setStatus(parseInt(e.target.value))}>
              <option value={0}>Todas</option>
              <option value={1}>Ativas</option>
              <option value={2}>Concluídas</option>
            </select>
          </div>
        </div>
      </div>
      {showFilters && <div className="filtrosMobile">
        <div>
          <label>Período de:</label>
          <input type="date" value={periodoDe} onChange={e => setPeriodoDe(e.target.value)}/>
        </div>
        <div>
          <label>Período até:</label>
          <input type="date" value={periodoAte} onChange={e => setPeriodoAte(e.target.value)}/>
        </div>
        <div>
          <label>Status:</label>
          <select value={status} onChange={e => setStatus(parseInt(e.target.value))}>
            <option value={0}>Todas</option>
            <option value={1}>Ativas</option>
            <option value={2}>Concluídas</option>
          </select>
        </div>
      </div>}
    </div>
  )
}
export default Filters;
