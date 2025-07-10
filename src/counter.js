import React, { Component } from 'react';
import './style.css';

const teams = ['SRH', 'RCB', 'MI', 'RR', 'CSK', 'KKR', 'LSG', 'GT', 'PBKS', 'DC'];

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamA: '',
      teamB: '',
      tossWinner: '',
      decision: '',
      step: 1,
      count: 0,
      wk: 0,
      balls: 0,
      fovers: '0.0',
      innings: 1,
      target: null,
      bowlerStats: {},
      batterStats: {},
      batterList: Array.from({ length: 11 }, (_, i) =>`Batter ${i + 1}`),
      currentBatters: ['', ''],
      nextBatterIndex: 0,
      strikeIndex: 0,
      currentBowler: '',
      lastBowler: '',
      overBalls: 0,
      awaitingNewBatter: false,
      lastOutIndex: null
    };
  }

  handleToss = () => {
    const { teamA, teamB } = this.state;
    if (teamA && teamB && teamA !== teamB) {
      const winner = Math.random() < 0.5 ? teamA : teamB;
      this.setState({ tossWinner: winner, step: 2 });
    } else {
      alert("Please select two different teams.");
    }
  };

  handleDecision = (choice) => {
    this.setState({ decision: choice, step: 3 });
  };

  handleBowlerSelect = (e) => {
    const selected = e.target.value;
    if (selected === this.state.lastBowler) {
      alert("Bowler can't bowl consecutive overs!");
      return;
    }
    this.setState({ currentBowler: selected, overBalls: 0 });
  };

  handleBall = (runs, isWicket = false) => {
    if (this.state.awaitingNewBatter) {
      alert("Please select the next batter first.");
      return;
    }

    const {
      currentBowler, overBalls, balls, count, wk,
      innings, target, bowlerStats, currentBatters,
      batterStats, strikeIndex
    } = this.state;

    if (!currentBowler) {
      alert("Please select a bowler to start the over.");
      return;
    }

    const updatedCount = count + runs;
    const updatedBalls = balls + 1;
    const updatedWk = isWicket ? wk + 1 : wk;
    const totalOvers =`${Math.floor(updatedBalls / 6)}.${updatedBalls % 6};`

    // Update bowler stats
    const bowler = bowlerStats[currentBowler] || {
      balls: 0,
      overs: '0.0',
      runs: 0,
      wickets: 0
    };

    if (bowler.balls >= 24) {
      alert(`${currentBowler} has already bowled 4 overs.;`)
      return;
    }

    bowler.balls += 1;
    bowler.runs += runs;
    if (isWicket) bowler.wickets += 1;

    const fullOvers = Math.floor(bowler.balls / 6);
    const remBalls = bowler.balls % 6;
    bowler.overs =`${fullOvers}.${remBalls};`

    const newBowlerStats = {
      ...bowlerStats,
      [currentBowler]: bowler
    };

    // Update batter stats
    const batters = [...currentBatters];
    const striker = batters[strikeIndex];
    const batter = batterStats[striker] || {
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      out: false
    };

    batter.balls += 1;
    batter.runs += runs;
    if (runs === 4) batter.fours += 1;
    if (runs === 6) batter.sixes += 1;
    if (isWicket) batter.out = true;

    const newBatterStats = {
      ...batterStats,
      [striker]: batter
    };

    // Strike rotation
    let newStrikeIndex = strikeIndex;
    if (!isWicket && runs % 2 === 1) {
      newStrikeIndex = 1 - strikeIndex;
    }

    // On over end
    const newOverBalls = overBalls + 1;
    const overComplete = newOverBalls === 6;
    if (overComplete) {
      newStrikeIndex = 1 - newStrikeIndex;
    }

    // Wicket Handling
    if (isWicket) {
      this.setState({
        batterStats: newBatterStats,
        bowlerStats: newBowlerStats,
        count: updatedCount,
        wk: updatedWk,
        balls: updatedBalls,
        fovers: totalOvers,
        overBalls: overComplete ? 0 : newOverBalls,
        lastBowler: overComplete ? currentBowler : this.state.lastBowler,
        currentBowler: overComplete ? '' : currentBowler,
        awaitingNewBatter: true,
        lastOutIndex: strikeIndex
      });
      return;
    }

    this.setState({
      count: updatedCount,
      wk: updatedWk,
      balls: updatedBalls,
      fovers: totalOvers,
      bowlerStats: newBowlerStats,
      batterStats: newBatterStats,
      overBalls: overComplete ? 0 : newOverBalls,
      lastBowler: overComplete ? currentBowler : this.state.lastBowler,
      currentBowler: overComplete ? '' : currentBowler,
      strikeIndex: newStrikeIndex
    }, () => {
      if (innings === 1 && (updatedWk === 10 || updatedBalls === 120)) {
        this.setState({
          target: updatedCount + 1,
          innings: 2,
          count: 0,
          wk: 0,
          balls: 0,
          fovers: '0.0',
          bowlerStats: {},
          batterStats: {},
          batterList: Array.from({ length: 11 }, (_, i) =>`Batter ${i + 1}`),
          currentBatters: ['', ''],
          nextBatterIndex: 0,
          strikeIndex: 0,
          currentBowler: '',
          lastBowler: '',
          overBalls: 0,
          awaitingNewBatter: false,
          lastOutIndex: null
        });
      }

      if (innings === 2 && (updatedWk === 10 || updatedBalls === 120 || updatedCount >= target)) {
        this.setState({ step: 4 });
      }
    });
  };

  reset = () => {
    this.setState({
      teamA: '',
      teamB: '',
      tossWinner: '',
      decision: '',
      step: 1,
      count: 0,
      wk: 0,
      balls: 0,
      fovers: '0.0',
      innings: 1,
      target: null,
      bowlerStats: {},
      batterStats: {},
      batterList: Array.from({ length: 11 }, (_, i) =>`Batter ${i + 1}`),
      currentBatters: ['', ''],
      nextBatterIndex: 0,
      strikeIndex: 0,
      currentBowler: '',
      lastBowler: '',
      overBalls: 0,
      awaitingNewBatter: false,
      lastOutIndex: null
    });
  };

  renderResult = () => {
    const { teamA, teamB, tossWinner, decision, target, count, wk } = this.state;
    const teamBattingFirst = (tossWinner === teamA && decision === 'bat') || (tossWinner === teamB && decision === 'bowl') ? teamA : teamB;
    const teamBattingSecond = teamA === teamBattingFirst ? teamB : teamA;

    if (count >= target) {
      return <h2>{teamBattingSecond} won by {10 - wk} wickets</h2>;
    } else {
      return <h2>{teamBattingFirst} won by {target - count - 1} runs</h2>;
    }
  };

  render() {
    const {
      teamA, teamB, tossWinner, decision, step,
      innings, count, wk, balls, fovers, target,
      bowlerStats, batterStats, currentBowler, lastBowler, overBalls,
      batterList, currentBatters, awaitingNewBatter
    } = this.state;

    const bowlerList = Object.keys(bowlerStats);
    if (currentBowler && !bowlerList.includes(currentBowler)) {
      bowlerList.push(currentBowler);
    }

    return (
      <div className="app">
        <div className="overlay">
          <h1>🏏 Cricket Scoring App</h1>

          {step === 1 && (
            <div>
              <h2>Select Teams</h2>
              <select value={teamA} onChange={e => this.setState({ teamA: e.target.value })}>
                <option value="">Select a team </option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <select value={teamB} onChange={e => this.setState({ teamB: e.target.value })}>
                <option value="">Select opponent team</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <button onClick={this.handleToss}>Toss</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>{tossWinner} won the toss</h2>
              <button onClick={() => this.handleDecision('bat')}>Bat</button>
              <button onClick={() => this.handleDecision('bowl')}>Bowl</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>Innings {innings}</h2>
              {innings === 2 && <h3>Target: {target} | Balls Left: {120 - balls}</h3>}
              <h2>Score: {count}/{wk}</h2>
              <h3>Overs: {fovers}</h3>

              {balls === 0 && wk === 0 && (
                <div>
                  <h3>Select Opening Batters</h3>
                  <select
                    value={currentBatters[0]}
                    onChange={e => {
                      const selected = e.target.value;
                      const others = batterList.filter(b => b !== selected);
                      this.setState({
                        currentBatters: [selected, ''],
                        batterList: others
                      });
                    }}
                  >
                    <option value="">Select Striker</option>
                    {batterList.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>

                  <select
                    value={currentBatters[1]}
                    onChange={e => {
                      const selected = e.target.value;
                      const used = currentBatters[0];
                      const others = batterList.filter(b => b !== selected && b !== used);
                      this.setState({
                        currentBatters: [used, selected],
                        batterList: others
                      });
                    }}
                    disabled={!currentBatters[0]}
                  >
                    <option value="">Select Non-Striker</option>
                    {batterList.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              {overBalls === 0 && (
                <div>
                  <h3>Select Bowler for Next Over</h3>
                  <select onChange={this.handleBowlerSelect}>
                    <option value="">Select Bowler</option>
                    {Array.from({ length: 11 }).map((_, i) => {
                      const name = `Bowler ${i + 1}`;
                      return (
                        <option
                          key={i}
                          value={name}
                          disabled={lastBowler === name || (bowlerStats[name]?.balls || 0) >= 24}
                        >
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {awaitingNewBatter && (
                <div>
                  <h3>Select New Batter</h3>
                  <select
                    onChange={e => {
                      const name = e.target.value;
                      const updatedBatters = [...currentBatters];
                      updatedBatters[this.state.lastOutIndex] = name;
                      const updatedList = batterList.filter(b => b !== name);
                      this.setState({
                        currentBatters: updatedBatters,
                        batterList: updatedList,
                        awaitingNewBatter: false
                      });
                    }}
                  >
                    <option value="">Select Batter</option>
                    {batterList.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="buttons">
                <button onClick={() => this.handleBall(0)}>Dot</button>
                <button onClick={() => this.handleBall(1)}>One</button>
                <button onClick={() => this.handleBall(2)}>Two</button>
                <button onClick={() => this.handleBall(3)}>Three</button>
                <button onClick={() => this.handleBall(4)}>Four</button>
                <button onClick={() => this.handleBall(6)}>Six</button>
                <button onClick={() => this.handleBall(0, true)}>Wicket</button>
                <button onClick={this.reset}>Reset</button>
              </div>

              <h2>Bowling Scorecard</h2>
              <table style={{ margin: "auto", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Bowler</th><th>Overs</th><th>Runs</th><th>Wickets</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bowlerStats).map(([name, stats]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{stats.overs}</td>
                      <td>{stats.runs}</td>
                      <td>{stats.wickets}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2>Batting Scorecard</h2>
              <table style={{ margin: "auto", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Batter</th><th>Runs</th><th>Balls</th><th>4s</th><th>6s</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(batterStats).map(([name, stats]) => (
                    <tr key={name}>
                      <td>{name} {currentBatters.includes(name) && !stats.out ? '*' : ''}</td>
                      <td>{stats.runs}</td>
                      <td>{stats.balls}</td>
                      <td>{stats.fours}</td>
                      <td>{stats.sixes}</td>
                      <td>{stats.out ? "Out" : "Not Out"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>Match Over!</h2>
              {this.renderResult()}
              <button onClick={this.reset}>Restart</button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Counter;