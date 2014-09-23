
module.exports = function(opts) {
  require('./types/counter')({})
  require('./types/counterset')({})
  require('./types/growset')({})
  require('./types/onceset')({})
  require('./types/register')({})
  require('./types/set')({})
  require('./types/map')({})
}

if(!module.parent)
  module.exports({ })
