/** @jsx React.DOM */
var Counter = require('./counter')
var Register = require('./register')
var Growset = require('./growset')
var Onceset = require('./onceset')
var Set = require('./set')

var colors = {
  green: 'rgb(85, 131, 80)',
  red: 'rgb(182, 105, 105)'
}
var paneltypes = ['panel-primary', 'panel-warning']

module.exports = React.createClass({
  getInitialState: function() {
    return { changes: [], data: this.props.obj.get() }
  },
  onChange: function(color, text) {
    this.state.changes.push({ color: colors[color], text: text })
    this.setState(this.state)
    this.props.onDirty(true)
  },
  handleCommit: function() {
    this.props.obj.put(this.state.data, function(err) {
      if (err) throw err
      this.setState({ changes: [], data: this.props.obj.get() })
      this.props.onDirty(false)
    }.bind(this))
  },
  render: function() {
    var changes = this.state.changes.map(function(change, i) {
      var id = 'change' + i
      return <div key={id} style={({color: change.color})}>{change.text}</div>
    })
    var commitButton = (this.state.changes.length) ?
      <button className="btn btn-success btn-sm" onClick={this.handleCommit}>commit changes</button> :
      <button className="btn btn-default btn-sm" onClick={this.handleCommit} disabled>commit changes</button>
    var panelCls = 'object panel ' + paneltypes[this.props.objnum]
    return <div className={panelCls}>
      <div className="panel-heading"><h3 className="panel-title">Replica {this.props.objnum+1}</h3></div>
      <div className="panel-body">
        <Counter  obj={this.state.data} onChange={this.onChange} />
        <Register obj={this.state.data} onChange={this.onChange} />
        <Growset  obj={this.state.data} onChange={this.onChange} />
        <Onceset  obj={this.state.data} onChange={this.onChange} />
        <Set      obj={this.state.data} onChange={this.onChange} />
        <div className="changes">{changes} {commitButton}</div>
      </div>
    </div>
  }
})