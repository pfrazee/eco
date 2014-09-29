/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return this.props.obj
  },
  handleSet: function(e) {
    var v = this.refs.reg.getDOMNode().value
    this.props.obj.reg = v
    this.props.onChange('green', 'register: set '+v)
    this.setState(this.props.obj)
  },
  render: function() {
    return <div className="register field">
      Register<br/>
      <input type="text" defaultValue={this.props.obj.reg} ref="reg" />
      <button onClick={this.handleSet}>set</button>
    </div>;
  }
})