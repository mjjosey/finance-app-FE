import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppRouter, { navItems } from './AppRouter';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { drawerWidth } from './constants';
import { useThemeMode } from './ThemeProvider';

export default function Layout(props) {
  const { window } = props;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { mode, toggleThemeMode } = useThemeMode();
  const isDark = mode === 'dark';

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        LOGO
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.link}
              sx={{
                textAlign: 'center',
                borderRadius: 1,
                backgroundColor:
                  location.pathname === item.link ? 'rgba(25,118,210,0.16)' : 'transparent',
                color: location.pathname === item.link ? '#1d4ed8' : 'inherit',
                fontWeight: location.pathname === item.link ? 700 : 500,
                boxShadow: location.pathname === item.link ? 'inset 0 -2px 0 #1d4ed8' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: '#1d4ed8',
                },
                '& .MuiListItemText-root': {
                  color: location.pathname === item.link ? '#1d4ed8 !important' : 'inherit',
                },
                '& .MuiListItemText-primary': {
                  color: location.pathname === item.link ? '#1d4ed8 !important' : 'inherit',
                  fontWeight: location.pathname === item.link ? 700 : 500,
                },
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 12, display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.link}
                  sx={{
                    color: isActive ? '#f8fafc !important' : '#fff',
                    borderRadius: 1,
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                    fontWeight: isActive ? 700 : 400,
                    boxShadow: isActive ? 'inset 0 -2px 0 #f8fafc' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc !important',
                    },
                  }}
                >
                  {item.text}
                </Button>
              );
            })}
            <IconButton
              color="inherit"
              onClick={toggleThemeMode}
              sx={{ ml: 1 }}
              aria-label="toggle theme"
            >
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 3, width: '100%' }}>
        <Toolbar />
        <AppRouter />
      </Box>
    </Box>
  );
}
