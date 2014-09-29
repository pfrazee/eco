/** @jsx React.DOM */
module.exports = React.createClass({
  getInitialState: function() {
    return { log: [] }
  },
  render: function() {
    function renderMsg(id, msg) {
      if (msg.op == 'init') return <div className="log-entry" key={id}>init</div>
      if (msg.op == 'declare') return <div className="log-entry" key={id}>declare {msg.args[0]} as type: {msg.args[1]}</div>
      return <div className="log-entry" key={id}>
        {msg.path}: {msg.op} {msg.args[0] || ''} {msg.args[1] || ''}
      </div>
    }
    var entries = this.state.log.reverse().map(function(entry, i) {
      var id = 'log-entry' + i
      if (Array.isArray(entry)) {
        return <div className="log-branch">{renderMsg(id+'-left', entry[0].msg)}{renderMsg(id+'-right', entry[1].msg)}</div>
      }
      return renderMsg(id, entry.msg)
    })
    return <div className="log">{entries}</div>
  }
})