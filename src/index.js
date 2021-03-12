import React from "react";
import ReactDOM from "react-dom";
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={() => props.onClick()} style = {{backgroundColor : props.backgroundcolor}}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square key={`b${i}`} 
    value={this.props.squares[i]}
    onClick ={() => this.props.onClick(i)}
    backgroundcolor = {
      this.props.winline ? this.props.winline.includes(i)?  "blue" : null :null //勝利時、勝利マスの色付け：勝利時、勝利外のマスの色付け：常時の色付け
    }/>; //propsで渡す引数（value, onClick, color）
  }
  
  // パラダイムについて考える
  render() {
    const board = [];
    const boardline = 4;
    
    for(let i=0; i < boardline; i++){
      const row = [];
      for(let j = 0; j < boardline; j++){
        const num = i * boardline + j;
        row.push(this.renderSquare(num));
      }
      board.push(<div key={`a${i}`} className="board-row">{row}</div>)
    }

    return (
      <div>
        { board }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      histories:[{
        squares: Array(16).fill(null),
        point: -1,
      }],
      step: 0,
      isToggleOn: true,
    }
  }

  handleClick(i) {
    const histories = (this.state.step !== this.state.histories.length - 1)
      ? (this.state.isToggleOn 
        ? this.state.histories.slice(0, this.state.step + 1)
        : this.state.histories.slice(-(this.state.step + 1), this.state.histories.length))
      :this.state.histories.slice(0)
    
    const history = {
      squares: this.state.isToggleOn ? histories[histories.length - 1].squares.slice(0) : histories[0].squares.slice(0),
      point: i,
      selected: false,
    }

    if(calculateWinner(history.squares) || history.squares[i]) {
      return;
    }


    histories.forEach(history => history.selected = false)
    history.squares[i] = histories.length % 2 === 0 ? 'O' : 'X';

    this.setState({
      histories: this.state.isToggleOn ? histories.concat([history]) : [history].concat(histories),
      step: histories.length,
    })    
  }

  toggleClick = () => {
    const selected = this.state.histories.findIndex(history => history.selected === true); //既に選択されている配列があれば取得

    if(selected !== -1){
      this.state.isToggleOn 
      ? this.jumpTo(selected)
      : this.jumpTo(this.state.histories.length -1 - selected)
    }

    this.setState({
      histories: this.state.histories.sort((a, b) => { 
        return a > b? 1:-1
      }),
      isToggleOn: !this.state.isToggleOn
    })

  }

  jumpTo(step){
    const histories = this.state.histories.map((history, index) => {
      history.selected = this.state.isToggleOn 
        ? index === step
        : index === this.state.histories.length - 1 - step
      return history;
    })

    this.setState({
      histories: histories,
      step: step,
    })
  }

  listCreate(history, index){
   const order = index ? `Go to index # ${index}` : 'Go to game start'
   return (
    <li key={index}>
      <button  onClick={() => {
        this.jumpTo(index);
      }} style = {history.selected ? {fontWeight: 'bold'} : { fontWeight: 'normal'}} >{order}</button>
    </li>
   )
  }

  render() {
    const histories = this.state.histories;
    const currentIndex = histories.findIndex(history => history.selected === true)
    const current = currentIndex !== -1 
      ? (histories[currentIndex]) //履歴選択がある場合は、選択したものがCurrent
      : (this.state.isToggleOn ? histories[histories.length - 1] : histories[0]) //履歴選択がない場合は、 昇降順に応じた最新歴がCurrent

    const winner = calculateWinner(current.squares);
    const winline = winner ? winner.line : null
    const status = winner 
      ? (winner === "Draw"
        ? winner
        : "Winner: " + winner.winner )
      :"Next player: " + (this.state.step % 2 === 0 ? "X" : "O");

    const moves = histories.map((history, index) =>{ 
      return (this.listCreate(history, this.state.isToggleOn? index : (histories.length - 1) - index))
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={
              this.state.isToggleOn 
                ?this.state.histories[this.state.step].squares
                : this.state.histories[(this.state.histories.length - 1)- this.state.step].squares}
            onClick={(i) => this.handleClick(i)}
            winline= {winline}
          />
        </div>
        <div className="game-info">
          <div>
            { status }
            { current.point !== -1 ? <p>Coordinate: (col:{current.point % 4 + 1}, row:{Math.floor(current.point/4 + 1)}, player: { this.state.step % 2 === 0 ? 'O' : 'X' })</p>
              : <p>Let's play</p>}
          </div>
          <ol>{moves}</ol>
          <button onClick={this.toggleClick}>
            {this.state.isToggleOn ? '降順' : '昇順'}
          </button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [1, 2, 3],
    [4, 5, 6],
    [5, 6, 7],
    [8, 9, 10],
    [9, 10, 11],
    [12, 13, 14],
    [13, 14, 15],
    [0, 4, 8],
    [4, 8, 12],
    [1, 5, 9],
    [5, 9, 13],
    [2, 6, 10],
    [6, 10, 14],
    [3, 7, 11],
    [7, 11, 15],
    [0, 5, 10],
    [5, 10, 15],
    [4, 9, 14],
    [1, 6, 11],
    [3, 6, 9],
    [6, 9, 12],
    [2, 5, 8],
    [7, 10, 13],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    //squares[a],squares[b],squares[c]がすべて同じ値であれば、squares[a]を返す
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], line:lines[i]};
    }
  }

  if(!squares.includes(null)) {
    return 'Draw';
  }

  return null;
}