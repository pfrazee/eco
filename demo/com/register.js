/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return this.props.obj
  },
  onSet: function(e) {
    var v = this.refs.reg.getDOMNode().value
    this.props.obj.reg = v
    this.props.onChange('green', 'register: set '+v)
    this.setState(this.props.obj)
  },
  onChange: function(event) {
    this.props.obj.reg = event.target.value
    this.setState(this.state);
  },
  render: function() {
    return <div className="register field">
      Register<br/>
      <input type="text" value={this.props.obj.reg} onChange={this.onChange} ref="reg" />
      <button className="btn btn-default btn-xs" onClick={this.onSet}>set</button>
    </div>;
  }
})