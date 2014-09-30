/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return this.props.obj
  },
  handleInc: function(e) {
    this.props.obj.counter++
    this.props.onChange('green', 'counter: inc')
    this.setState(this.props.obj)
  },
  handleDec: function(e) {
    this.props.obj.counter--
    this.props.onChange('red', 'counter: dec')
    this.setState(this.props.obj)
  },
  render: function() {
    return <div className="counter field">
      Counter<br/>
      <input type="text" value={this.props.obj.counter} readOnly />
      <button className="btn btn-default btn-xs" onClick={this.handleInc}>+</button><button className="btn btn-default btn-xs" onClick={this.handleDec}>&ndash;</button>
    </div>;
  }
})