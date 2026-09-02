import unittest
from unittest.mock import patch, MagicMock

class TestSpriteSheetManager(unittest.TestCase):
    def setUp(self):
        self.manager = SpriteSheetManager()

    def test_registerSpriteSheet_default_config(self):
        self.manager.registerSpriteSheet('test', {})
        sheet = self.manager.sheets['test']
        self.assertEqual(sheet['frameWidth'], 64)
        self.assertEqual(sheet['frameHeight'], 64)
        self.assertEqual(sheet['columns'], 8)
        self.assertEqual(sheet['rows'], 8)
        self.assertEqual(sheet['animations'], {})

    def test_registerSpriteSheet_full_config(self):
        config = {
            'frameWidth': 32,
            'frameHeight': 32,
            'columns': 4,
            'rows': 4,
            'animations': {'test': [0, 1, 2]}
        }
        self.manager.registerSpriteSheet('test', config)
        sheet = self.manager.sheets['test']
        self.assertEqual(sheet, config)

    def test_calculateFramePositions(self):
        sheet = {
            'frameWidth': 64,
            'frameHeight': 64,
            'columns': 8,
            'rows': 8
        }
        self.manager.calculateFramePositions(sheet)
        self.assertEqual(len(sheet['framePositions']), 64)
        for i, pos in enumerate(sheet['framePositions']):
            col = i % 8
            row = i // 8
            self.assertEqual(pos, (col * 64, row * 64))

    def test_getAnimationFrames_unregistered_sheet(self):
        self.assertIsNone(self.manager.getAnimationFrames('unknown', 'idle'))

    def test_getAnimationFrames_before_load(self):
        self.manager.registerSpriteSheet('test', {})
        self.assertIsNone(self.manager.getAnimationFrames('test', 'idle'))

    def test_getAnimationFrames_known_animation(self):
        sheet = {
            'animations': {
                'idle': [0, 1, 2, 3],
                'walk': [4, 5, 6, 7]
            }
        }
        self.manager.sheets['test'] = sheet
        self.assertEqual(self.manager.getAnimationFrames('test', 'idle'), [0, 1, 2, 3])

    def test_getCurrentFrame_wraparound(self):
        sheet = {
            'animations': {
                'idle': [0, 1, 2, 3]
            }
        }
        self.manager.sheets['test'] = sheet
        self.assertEqual(self.manager.getCurrentFrame('test', 'idle', 4), 0)
        self.assertEqual(self.manager.getCurrentFrame('test', 'idle', 7), 3)

    def test_loadSpriteSheet_not_registered(self):
        self.assertFalse(self.manager.loadSpriteSheet('unknown'))

    @patch('path.to.module.Image')
    def test_loadSpriteSheet(self, mock_image):
        mock_img = MagicMock()
        mock_image.return_value = mock_img
        self.manager.registerSpriteSheet('test', {})
        self.manager.loadSpriteSheet('test')
        mock_img.onload.assert_called_once()
        self.assertTrue('animations' in self.manager.sheets['test'])

    @patch('path.to.module.Image')
    def test_loadSpriteSheet_error(self, mock_image):
        mock_img = MagicMock()
        mock_image.return_value = mock_img
        mock_img.onerror = MagicMock()
        self.manager.registerSpriteSheet('test', {})
        self.manager.loadSpriteSheet('test')
        mock_img.onerror.assert_called_once()

    @patch('path.to.module.ctx')
    def test_drawFrame(self, mock_ctx):
        sheet = {
            'framePositions': [(0, 0), (64, 0), (128, 0)],
            'images': {'test': mock_ctx}
        }
        self.manager.sheets['test'] = sheet
        self.manager.drawFrame(mock_ctx, 'test', 'idle', 1, 10, 20)
        mock_ctx.drawImage.assert_called_once_with(mock_ctx, 64, 0, 64, 64, 10, 20, 64, 64)

    @patch('path.to.module.ctx')
    def test_drawFrame_no_frame(self, mock_ctx):
        sheet = {
            'framePositions': [(0, 0), (64, 0), (128, 0)],
            'images': {'test': mock_ctx}
        }
        self.manager.sheets['test'] = sheet
        self.manager.drawFrame(mock_ctx, 'test', 'idle', 3, 10, 20)  # No frame 3
        mock_ctx.drawImage.assert_not_called()

if __name__ == '__main__':
    unittest.main()