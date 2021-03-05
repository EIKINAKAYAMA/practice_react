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
    return <Square value={this.props.squares[i]} onClick ={() => this.props.onClick(i)}/>;
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
        </div>
        <div className="board-row">
          {this.renderSquare(4)}
          {this.renderSquare(5)}
          {this.renderSquare(6)}
          {this.renderSquare(7)}
        </div>
        <div className="board-row">
          {this.renderSquare(8)}
          {this.renderSquare(9)}
          {this.renderSquare(10)}
          {this.renderSquare(11)}
        </div>

        <div className="board-row">
          {this.renderSquare(12)}
          {this.renderSquare(13)}
          {this.renderSquare(14)}
          {this.renderSquare(15)}
        </div>
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
        point: -1
      }],
      step: 0
    }
  }

  handleClick(i) {
    console.log('i:', i)
    const history = {
      squares: this.state.histories[this.state.histories.length - 1].squares.slice(0),
      point: i,
      selected: false
    }

    // 勝利判定、勝利の場合はXかOが返却、判定負荷の場合はNULLが返却
    if (calculateWinner(history.squares) || history.squares[i]) {
      return;
    }

    this.state.histories.forEach(function(e){
      e.selected = false
    })

    //数値をXかOに変更して、代入
    history.squares[i] = this.state.histories.length % 2 == 0 ? 'X' : 'O';
    this.setState({
      histories: this.state.histories.concat([history]),
      step: this.state.histories.length,
    })
  }

  jumpTo(step){
    console.log('step:', step)
    const histories = this.state.histories.map((history, index) => {
      history.selected = index === step;
      return history;
    })
    this.setState({
      histories: histories,
      step: step
    });
  }

  render() {
    const histories = this.state.histories;
    const current = histories[histories.length - 1]
    const winner = calculateWinner(current.squares);
    const status = winner ? "Winner: " + winner : "Next player: " + (this.state.xIsNext ? "X" : "O");

    const moves = histories.map((history, index) =>{
      console.log('index:',index);
      const desc = index ? `Go to index # ${index}` : 'Go to game start';
      return (
        <li key={index}>
          <button onClick={() => {
            console.log("TEST");
            this.jumpTo(index);
          }} style={history.selected ? {fontWeight: 'bold'} : { fontWeight: 'normal'}} >{desc}</button>
        </li>
      )
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={this.state.histories[this.state.step].squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>
            { status }         
            { current.point !== -1 ? <p>Coordinate: (col:{current.point % 4 + 1}, row:{Math.floor(current.point/4 + 1)}, player: { this.state.xIsNext ? 'O' : 'X' })</p>
              : <p>Let's play</p>}
          </div>
          <ol>{moves}</ol>
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