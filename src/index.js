import React from "react";
import ReactDOM from "react-dom";
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square key={`b${i}`} value={this.props.squares[i]} onClick ={() => this.props.onClick(i)}/>;
  }

  // パラダイムについて考える
  render() {
    const board = [];

    for(let i=0; i < 4; i++){
      const row = [];
      for(let j = 0; j < 4; j++){
        const num = i * 4 + j;
        row.push(this.renderSquare(num));
      }
      //keyエラーが発生するのはなぜ？ アルファベットをつける。
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
    
    if(this.state.isToggleOn){
      //etStateは最後、仮でセット。 
      const histories = (this.state.step !== this.state.histories.length - 1)
        ? this.state.histories.slice(0, this.state.step + 1)
        :this.state.histories.slice(0)

      const history = {
        squares: histories[histories.length - 1].squares.slice(0),
        point: i,
        selected: false,
      }

      // 勝利判定、勝利の場合はXかOが返却、判定負荷の場合はNULLが返却
      if (calculateWinner(history.squares) || history.squares[i]) {
        return;
      }

      histories.forEach(history => history.selected = false)
      history.squares[i] = histories.length % 2 === 0 ? 'O' : 'X';

      this.setState({
        histories: histories.concat([history]),
        step: histories.length,
      })

    }else{
      const histories = (this.state.step !== this.state.histories.length - 1)
        ? this.state.histories.slice(-(this.state.step + 1), this.state.histories.length)
        : this.state.histories.slice(0)
      
      const history = {
        squares: histories[0].squares.slice(0),
        point: i,
        selected: false,
      }
      if (calculateWinner(history.squares) || history.squares[i]) {
        return;
      }

      histories.forEach(history => history.selected = false)
      history.squares[i] = histories.length % 2 === 0 ? 'O' : 'X';

      this.setState({
        histories: [history].concat(histories),
        step: histories.length,
      })
    }
    
  }

  toggleClick = () => {
    const histories = this.state.histories;
    //既に選択されている配列があれば取得
    const selected = histories.findIndex(history => history.selected === true);
    const reverselected = histories.length -1 - selected;
    
    if(selected !== -1){
      this.state.isToggleOn 
      ? this.jumpTo(selected)
      : this.jumpTo(reverselected)
    }

    histories.sort((a, b) => {
      return a > b? 1:-1
    })

    this.setState({
      histories: histories,
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

  render() {

    const histories = this.state.histories;
    const currentIndex = histories.findIndex(history => history.selected === true)
    const current = currentIndex !== -1 
      ? (histories[currentIndex]) //履歴選択がある場合は、選択したものがCurrent
      : (this.state.isToggleOn 
        ? histories[histories.length - 1] : histories[0]) //履歴選択がない場合は、 昇降順に応じた最新歴がCurrent

    const winner = calculateWinner(current.squares);
    const status = winner ? "Winner: " + winner : "Next player: " + (this.state.step % 2 === 0 ? "X" : "O");  

    const moves = histories.map((history, index) =>{
      if( this.state.isToggleOn){
        const desc = index ? `Go to index # ${index}` : 'Go to game start'
        return (
          <li key={index}>
            <button  onClick={() => {
              this.jumpTo(index);
            }} style = {history.selected ? {fontWeight: 'bold'} : { fontWeight: 'normal'}} >{desc}</button>
          </li>
        )
      }else {
        const reverseindex = (histories.length - 1)- index
        const asc = reverseindex ? `Go to index # ${reverseindex}` : 'Go to game start'
        return (
          <li key={reverseindex}>
            <button  onClick={() => {
              this.jumpTo(reverseindex);
              // 状態を使わずに他の関数内で、ダイレクトに編集することはできないのか？
            }} style = {history.selected ? {fontWeight: 'bold'} : { fontWeight: 'normal'}} >{asc}</button>
          </li>
        )
      }
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
      return squares[a];
    }
  }
  return null;
}