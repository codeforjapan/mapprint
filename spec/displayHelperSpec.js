var displayHelper = require('../source/javascripts/displayHelper')

describe('displayHelper', function() {
  describe('getNowYMD', () => {
    it('formats a js Date object into a formatted string', function() {
      var firstMonthIsZeroIndex = 0;
      var stubDate = new Date(2018, firstMonthIsZeroIndex, 1, 11, 11)

      var formattedDate = displayHelper.getNowYMD(stubDate)

      expect(formattedDate).toBe('2018年01月01日11時11分')
    })
  })

  describe('getPrintDate', () => {
    it('formats a js Date object into a formatted printDate description', function() {
      var firstMonthIsZeroIndex = 0;
      var stubDate = new Date(2018, firstMonthIsZeroIndex, 1, 11, 11)

      var formattedDate = displayHelper.getPrintDate(stubDate)

      expect(formattedDate).toBe('このマップは 2018年01月01日11時11分 に印刷しました。')
    })
  })
})
