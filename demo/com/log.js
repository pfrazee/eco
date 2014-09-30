/** @jsx React.DOM */

var paneltypes = ['panel-primary', 'panel-warning']

module.exports = React.createClass({
  getInitialState: function() {
    return { log: [] }
  },
  render: function() {
    function renderMsg(id, msg) {
      if (msg.op == 'init') return <p className="log-entry" key={id}>init</p>
      if (msg.op == 'declare') return <p className="log-entry" key={id}>declare {msg.args[0]} as type: {msg.args[1]}</p>
      return <p className="log-entry" key={id}>
        {msg.path}: {msg.op} {msg.args[0] || ''} {msg.args[1] || ''}
      </p>
    }
    var entries = this.state.log.map(function(entry, i) {
      var id = 'log-entry' + i
      if (Array.isArray(entry)) {
        return <div className="log-branch">
          <small>concurrent:</small>
          <ul>
            <li>{renderMsg(id+'-left', entry[0].msg)}</li>
            <li>{renderMsg(id+'-right', entry[1].msg)}</li>
          </ul>
        </div>
      }
      return renderMsg(id, entry.msg)
    }).reverse()
    var panelCls = 'log panel ' + paneltypes[this.props.objnum]
    return <div className={panelCls}><div className="panel-body">{entries}</div><div className="panel-footer">Log {this.props.objnum+1}</div></div>
  }
})