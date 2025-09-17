import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import random
import math
import time
from tabulate import tabulate
import networkx as nx
from matplotlib.colors import to_rgba
import seaborn as sns
from datetime import datetime
import os
import json

class EnhancedUAFLP:
    """
    Enhanced Unequal Area Facility Layout Problem Solver
    
    This class implements an enhanced version of the UA-FLP algorithm with practical improvements:
    - Multi-objective optimization
    - Adjacency and relationship constraints
    - 3D visualization capabilities
    - Safety and regulatory factors
    - Flexibility for future planning
    - Advanced search mechanisms
    """
    
    def __init__(self, facility_width=25, facility_height=25, facility_depth=None):
        """Initialize the Enhanced UA-FLP solver"""
        self.facility_width = facility_width
        self.facility_height = facility_height
        self.facility_depth = facility_depth  # Optional for 3D layouts
        self.is_3d = facility_depth is not None
        
        # Department information
        self.departments = {}  # Dictionary to store department information
        self.fixed_departments = []  # List to store fixed departments
        self.movable_departments = []  # List to store departments that can be moved
        
        # Flow and relationship information
        self.flow_matrix = None  # Material flow between departments
        self.relationship_matrix = None  # Qualitative relationships (A, E, I, O, U, X)
        self.precedence_matrix = None  # Process sequence requirements
        
        # Physical constraints
        self.obstacles = []  # Fixed obstacles in the facility (walls, columns, etc.)
        self.special_locations = {}  # Special locations (entries, exits, loading docks)
        
        # Solution variables
        self.current_layout = None
        self.best_layout = None
        self.best_objective_value = float('inf')
        
        # Weights for multi-objective function
        self.weights = {
            'distance': 0.6,
            'adjacency': 0.2,
            'safety': 0.1,
            'flexibility': 0.1
        }
        
        # Environment factors
        self.noise_matrix = None
        self.hazard_matrix = None
        self.vibration_matrix = None
        
        # PLP and other algorithm components
        self.plp_list = []
        self.history = []  # For tracking algorithm progress
        
        # Reporting variables
        self.start_time = None
        self.end_time = None
        self.iterations = 0
        self.improvements = 0
        self.time_to_best = 0
        
        print("Enhanced UA-FLP solver initialized")
    
    def add_department(self, dept_id, width, height, depth=None, area=None, 
                      fixed=False, fixed_location=None, can_change_direction=True,
                      growth_factor=0.0, external_access_needed=False,
                      natural_light_needed=False, safety_level=0):
        """
        Add a department to the facility with enhanced attributes
        
        Parameters:
        -----------
        dept_id : str
            Unique department identifier
        width, height : float
            Dimensions of the department
        depth : float, optional
            Depth of the department (for 3D layout)
        area : float, optional
            Area of the department (if different from width*height)
        fixed : bool
            Whether the department location is fixed
        fixed_location : tuple
            (x, y) or (x, y, z) coordinates for fixed departments
        can_change_direction : bool
            Whether the department can be rotated
        growth_factor : float
            Expected growth factor (0.0 to 1.0) for future expansion
        external_access_needed : bool
            Whether the department needs external access
        natural_light_needed : bool
            Whether the department needs natural light
        safety_level : int (0-3)
            Safety risk level (0: low, 3: high)
        """
        if area is None:
            area = width * height
            
        department = {
            'id': dept_id,
            'width': width,
            'height': height,
            'depth': depth if self.is_3d else None,
            'area': area,
            'fixed': fixed,
            'location': fixed_location if fixed else None,
            'can_change_direction': can_change_direction,
            'current_direction': 'horizontal',  # Initial direction
            'growth_factor': growth_factor,
            'external_access_needed': external_access_needed,
            'natural_light_needed': natural_light_needed,
            'safety_level': safety_level
        }
        
        self.departments[dept_id] = department
        
        if fixed:
            self.fixed_departments.append(dept_id)
        else:
            self.movable_departments.append(dept_id)
            
        print(f"Department {dept_id} added {'(fixed)' if fixed else '(movable)'}")
        return self
    
    def add_obstacle(self, x, y, width, height, depth=None, obstacle_type="wall"):
        """Add a fixed obstacle to the facility"""
        obstacle = {
            'x': x,
            'y': y,
            'z': 0 if self.is_3d else None,
            'width': width,
            'height': height,
            'depth': depth if self.is_3d else None,
            'type': obstacle_type
        }
        self.obstacles.append(obstacle)
        print(f"{obstacle_type.capitalize()} obstacle added at ({x}, {y})")
        return self
    
    def add_special_location(self, location_id, x, y, location_type):
        """Add a special location like entry, exit, loading dock"""
        self.special_locations[location_id] = {
            'x': x,
            'y': y,
            'type': location_type
        }
        print(f"Special location {location_id} ({location_type}) added at ({x}, {y})")
        return self
    
    def set_flow_matrix(self, flow_data):
        """Set material flow between departments"""
        if isinstance(flow_data, dict):
            # Convert dict to DataFrame
            dept_ids = list(self.departments.keys())
            self.flow_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
            for (dept1, dept2), flow in flow_data.items():
                if dept1 in dept_ids and dept2 in dept_ids:
                    self.flow_matrix.loc[dept1, dept2] = flow
                    self.flow_matrix.loc[dept2, dept1] = flow
        else:
            # Assume DataFrame
            self.flow_matrix = flow_data
            
        print("Flow matrix set with dimensions:", self.flow_matrix.shape)
        return self
    
    def set_relationship_matrix(self, relationship_data):
        """
        Set relationship matrix using REL chart values:
        A: Absolutely necessary (4)
        E: Especially important (3)
        I: Important (2)
        O: Ordinary (1)
        U: Unimportant (0)
        X: Undesirable (-1)
        """
        rel_values = {'A': 4, 'E': 3, 'I': 2, 'O': 1, 'U': 0, 'X': -1}
        
        if isinstance(relationship_data, dict):
            # Convert dict to DataFrame
            dept_ids = list(self.departments.keys())
            self.relationship_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
            for (dept1, dept2), rel in relationship_data.items():
                if dept1 in dept_ids and dept2 in dept_ids:
                    # Convert letter to numeric value if needed
                    value = rel_values.get(rel, rel) if isinstance(rel, str) else rel
                    self.relationship_matrix.loc[dept1, dept2] = value
                    self.relationship_matrix.loc[dept2, dept1] = value
        else:
            # Assume DataFrame
            self.relationship_matrix = relationship_data
            
        print("Relationship matrix set with dimensions:", self.relationship_matrix.shape)
        return self
    
    def set_precedence_matrix(self, precedence_data):
        """Set process precedence requirements"""
        if isinstance(precedence_data, dict):
            # Convert dict to DataFrame
            dept_ids = list(self.departments.keys())
            self.precedence_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
            for (dept1, dept2), value in precedence_data.items():
                if dept1 in dept_ids and dept2 in dept_ids:
                    # 1 means dept1 should precede dept2
                    self.precedence_matrix.loc[dept1, dept2] = value
        else:
            # Assume DataFrame
            self.precedence_matrix = precedence_data
            
        print("Precedence matrix set with dimensions:", self.precedence_matrix.shape)
        return self
    
    def set_environment_factors(self, noise_matrix=None, hazard_matrix=None, vibration_matrix=None):
        """Set environmental factors like noise, hazards, and vibration"""
        dept_ids = list(self.departments.keys())
        
        if noise_matrix is not None:
            if isinstance(noise_matrix, dict):
                self.noise_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
                for dept, level in noise_matrix.items():
                    if dept in dept_ids:
                        self.noise_matrix.loc[dept, :] = level
            else:
                self.noise_matrix = noise_matrix
        
        if hazard_matrix is not None:
            if isinstance(hazard_matrix, dict):
                self.hazard_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
                for dept, level in hazard_matrix.items():
                    if dept in dept_ids:
                        self.hazard_matrix.loc[dept, :] = level
            else:
                self.hazard_matrix = hazard_matrix
        
        if vibration_matrix is not None:
            if isinstance(vibration_matrix, dict):
                self.vibration_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
                for dept, level in vibration_matrix.items():
                    if dept in dept_ids:
                        self.vibration_matrix.loc[dept, :] = level
            else:
                self.vibration_matrix = vibration_matrix
                
        print("Environmental factors set")
        return self
    
    def set_weights(self, weights):
        """Set weights for multi-objective function"""
        self.weights.update(weights)
        print("Optimization weights updated:", self.weights)
        return self
    
    def _calculate_manhattan_distance(self, loc1, loc2):
        """Calculate Manhattan distance between two locations"""
        return abs(loc1[0] - loc2[0]) + abs(loc1[1] - loc2[1])
    
    def _find_center(self, dept):
        """Find center coordinates of a department"""
        if dept['location'] is None:
            return None
            
        x, y = dept['location']
        if dept['current_direction'] == 'horizontal':
            center_x = x + dept['width'] / 2
            center_y = y + dept['height'] / 2
        else:  # vertical
            center_x = x + dept['height'] / 2
            center_y = y + dept['width'] / 2
            
        return (center_x, center_y)
    
    def _check_overlap(self, x, y, width, height, exclude_dept=None):
        """Check if a potential department placement overlaps with existing ones"""
        # Check facility boundaries
        if x < 0 or y < 0 or x + width > self.facility_width or y + height > self.facility_height:
            return True
            
        # Check overlap with other departments
        for dept_id, dept in self.departments.items():
            if dept_id == exclude_dept or dept['location'] is None:
                continue
                
            dept_x, dept_y = dept['location']
            if dept['current_direction'] == 'horizontal':
                dept_width, dept_height = dept['width'], dept['height']
            else:
                dept_width, dept_height = dept['height'], dept['width']
                
            # Check for overlap
            if (x < dept_x + dept_width and x + width > dept_x and
                y < dept_y + dept_height and y + height > dept_y):
                return True
                
        # Check overlap with obstacles
        for obstacle in self.obstacles:
            if (x < obstacle['x'] + obstacle['width'] and x + width > obstacle['x'] and
                y < obstacle['y'] + obstacle['height'] and y + height > obstacle['y']):
                return True
                
        return False
    
    def _generate_potential_locations(self):
        """Generate potential location points for department placement"""
        self.plp_list = []
        
        # Start with facility corners
        self.plp_list.append((0, 0))  # Bottom-left
        self.plp_list.append((0, self.facility_height))  # Top-left
        self.plp_list.append((self.facility_width, 0))  # Bottom-right
        self.plp_list.append((self.facility_width, self.facility_height))  # Top-right
        
        # Add fixed department corners
        for dept_id in self.fixed_departments:
            dept = self.departments[dept_id]
            if dept['location'] is not None:
                x, y = dept['location']
                width = dept['width'] if dept['current_direction'] == 'horizontal' else dept['height']
                height = dept['height'] if dept['current_direction'] == 'horizontal' else dept['width']
                
                # Add department corners
                self.plp_list.append((x, y))  # Bottom-left
                self.plp_list.append((x, y + height))  # Top-left
                self.plp_list.append((x + width, y))  # Bottom-right
                self.plp_list.append((x + width, y + height))  # Top-right
        
        # Add obstacle corners
        for obstacle in self.obstacles:
            x, y = obstacle['x'], obstacle['y']
            width, height = obstacle['width'], obstacle['height']
            
            # Add obstacle corners
            self.plp_list.append((x, y))  # Bottom-left
            self.plp_list.append((x, y + height))  # Top-left
            self.plp_list.append((x + width, y))  # Bottom-right
            self.plp_list.append((x + width, y + height))  # Top-right
        
        # Add special locations
        for loc_id, loc in self.special_locations.items():
            self.plp_list.append((loc['x'], loc['y']))
            
        print(f"Generated {len(self.plp_list)} potential location points")
        return self.plp_list
    
    def _calculate_adjacency_score(self):
        """Calculate adjacency score based on relationship matrix"""
        if self.relationship_matrix is None:
            return 0
            
        score = 0
        for dept1_id, dept1 in self.departments.items():
            for dept2_id, dept2 in self.departments.items():
                if dept1_id == dept2_id or dept1['location'] is None or dept2['location'] is None:
                    continue
                    
                center1 = self._find_center(dept1)
                center2 = self._find_center(dept2)
                distance = self._calculate_manhattan_distance(center1, center2)
                
                # Check if departments are adjacent
                # We consider them adjacent if they are very close
                is_adjacent = distance < max(dept1['width'], dept1['height'], dept2['width'], dept2['height'])
                
                rel_value = self.relationship_matrix.loc[dept1_id, dept2_id]
                
                # A, E, I relationships should be adjacent
                if rel_value >= 2 and is_adjacent:
                    score += rel_value
                # X relationships should NOT be adjacent
                elif rel_value < 0 and is_adjacent:
                    score -= 5  # High penalty for placing undesirable relationships adjacent
                # U relationships don't matter
        
        return score
    
    def _calculate_safety_score(self):
        """Calculate safety score based on safety levels and hazard matrix"""
        if self.hazard_matrix is None:
            return 0
            
        score = 0
        for dept1_id, dept1 in self.departments.items():
            if dept1['location'] is None:
                continue
                
            # Check if high-risk departments have emergency exits nearby
            if dept1['safety_level'] >= 2:
                has_exit_nearby = False
                for loc_id, loc in self.special_locations.items():
                    if loc['type'] in ['exit', 'emergency_exit']:
                        center = self._find_center(dept1)
                        distance = self._calculate_manhattan_distance(center, (loc['x'], loc['y']))
                        if distance < max(self.facility_width, self.facility_height) * 0.25:  # Within 25% of facility size
                            has_exit_nearby = True
                            break
                            
                if has_exit_nearby:
                    score += 5
                else:
                    score -= 10  # High penalty for high-risk departments without nearby exit
            
            # Check hazard separations
            for dept2_id, dept2 in self.departments.items():
                if dept1_id == dept2_id or dept2['location'] is None:
                    continue
                    
                hazard_level = self.hazard_matrix.loc[dept1_id, dept2_id] if self.hazard_matrix is not None else 0
                
                if hazard_level > 0:
                    center1 = self._find_center(dept1)
                    center2 = self._find_center(dept2)
                    distance = self._calculate_manhattan_distance(center1, center2)
                    
                    # Higher hazard levels require greater separation
                    min_distance = hazard_level * 5
                    
                    if distance < min_distance:
                        score -= (min_distance - distance) * 2  # Penalty for insufficient separation
        
        return score
    
    def _calculate_flexibility_score(self):
        """Calculate flexibility score based on growth factors and external access"""
        score = 0
        for dept_id, dept in self.departments.items():
            if dept['location'] is None:
                continue
                
            # Check if departments with high growth factors have space to expand
            if dept['growth_factor'] > 0:
                x, y = dept['location']
                width = dept['width'] if dept['current_direction'] == 'horizontal' else dept['height']
                height = dept['height'] if dept['current_direction'] == 'horizontal' else dept['width']
                
                # Check if there's room to grow in at least one direction
                growth_space = False
                expansion_directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]  # Right, Left, Up, Down
                
                for dx, dy in expansion_directions:
                    exp_x = x + (width if dx > 0 else 0)
                    exp_y = y + (height if dy > 0 else 0)
                    exp_width = max(width * dept['growth_factor'], 1) if dx != 0 else width
                    exp_height = max(height * dept['growth_factor'], 1) if dy != 0 else height
                    
                    if dx < 0:
                        exp_x -= exp_width
                    if dy < 0:
                        exp_y -= exp_height
                        
                    # Check if expansion area is free
                    if not self._check_overlap(exp_x, exp_y, exp_width, exp_height, exclude_dept=dept_id):
                        growth_space = True
                        break
                
                if growth_space:
                    score += 5 * dept['growth_factor']  # More points for higher growth departments
                else:
                    score -= 2 * dept['growth_factor']
            
            # Check if departments needing external access have it
            if dept['external_access_needed']:
                x, y = dept['location']
                width = dept['width'] if dept['current_direction'] == 'horizontal' else dept['height']
                height = dept['height'] if dept['current_direction'] == 'horizontal' else dept['width']
                
                # Check if at least one side is at facility boundary
                has_external_access = (
                    x == 0 or y == 0 or
                    x + width >= self.facility_width or
                    y + height >= self.facility_height
                )
                
                if has_external_access:
                    score += 10
                else:
                    score -= 15  # High penalty for departments needing external access but don't have it
        
        return score
    
    def _calculate_distance_cost(self):
        """Calculate total weighted distance cost"""
        if self.flow_matrix is None:
            return 0
            
        total_cost = 0
        for dept1_id, dept1 in self.departments.items():
            if dept1['location'] is None:
                continue
                
            center1 = self._find_center(dept1)
            
            for dept2_id, dept2 in self.departments.items():
                if dept1_id == dept2_id or dept2['location'] is None:
                    continue
                    
                flow = self.flow_matrix.loc[dept1_id, dept2_id]
                if flow > 0:
                    center2 = self._find_center(dept2)
                    distance = self._calculate_manhattan_distance(center1, center2)
                    total_cost += flow * distance
        
        return total_cost
    
    def _calculate_objective_function(self):
        """Calculate multi-objective function value"""
        # Distance cost (minimize)
        distance_cost = self._calculate_distance_cost()
        
        # Adjacency score (maximize)
        adjacency_score = self._calculate_adjacency_score()
        
        # Safety score (maximize)
        safety_score = self._calculate_safety_score()
        
        # Flexibility score (maximize)
        flexibility_score = self._calculate_flexibility_score()
        
        # Normalize the components
        # For distance cost, lower is better
        normalized_distance = min(1.0, distance_cost / (1000 + 1e-10))  # Assuming max cost around 1000
        
        # For other scores, higher is better
        normalized_adjacency = min(1.0, max(0, adjacency_score) / (100 + 1e-10))
        normalized_safety = min(1.0, max(0, safety_score) / (50 + 1e-10))
        normalized_flexibility = min(1.0, max(0, flexibility_score) / (50 + 1e-10))
        
        # Calculate weighted objective value (lower is better)
        objective_value = (
            self.weights['distance'] * normalized_distance - 
            self.weights['adjacency'] * normalized_adjacency - 
            self.weights['safety'] * normalized_safety - 
            self.weights['flexibility'] * normalized_flexibility
        )
        
        # Detailed breakdown for reporting
        breakdown = {
            'distance_cost': distance_cost,
            'adjacency_score': adjacency_score,
            'safety_score': safety_score,
            'flexibility_score': flexibility_score,
            'objective_value': objective_value
        }
        
        return objective_value, breakdown
    
    def _place_fixed_departments(self):
        """Place fixed departments at their predefined locations"""
        for dept_id in self.fixed_departments:
            dept = self.departments[dept_id]
            if dept['location'] is not None:
                x, y = dept['location']
                width = dept['width']
                height = dept['height']
                
                # Ensure fixed departments don't overlap
                if self._check_overlap(x, y, width, height, exclude_dept=dept_id):
                    print(f"Warning: Fixed department {dept_id} overlaps with other elements")
        
        print(f"Placed {len(self.fixed_departments)} fixed departments")
    
    def _try_place_department(self, dept_id, alt_idx):
        """Try to place a department at a given alternative location"""
        dept = self.departments[dept_id]
        
        if alt_idx >= len(self.plp_list):
            alt_idx = alt_idx % len(self.plp_list)
            
        # Try both directions if allowed
        directions = ['horizontal', 'vertical'] if dept['can_change_direction'] else ['horizontal']
        
        for direction in directions:
            width = dept['width'] if direction == 'horizontal' else dept['height']
            height = dept['height'] if direction == 'horizontal' else dept['width']
            
            x, y = self.plp_list[alt_idx]
            
            if not self._check_overlap(x, y, width, height, exclude_dept=dept_id):
                # Found a valid placement
                dept['location'] = (x, y)
                dept['current_direction'] = direction
                return True
        
        return False
    
    def _place_departments(self, placement_order):
        """Place all departments according to the given placement order"""
        # Clear previous locations for movable departments
        for dept_id in self.movable_departments:
            self.departments[dept_id]['location'] = None
        
        # Place fixed departments first
        self._place_fixed_departments()
        
        # Generate potential locations
        self._generate_potential_locations()
        
        # Try to place each movable department
        placed_count = 0
        
        for dept_id, alt_idx in placement_order:
            if dept_id in self.fixed_departments:
                continue  # Skip fixed departments
                
            # Try to place the department
            placed = False
            
            # Try the preferred alternative first
            if self._try_place_department(dept_id, alt_idx):
                placed = True
            else:
                # Try all alternatives if the preferred one fails
                for idx in range(len(self.plp_list)):
                    if self._try_place_department(dept_id, idx):
                        placed = True
                        break
            
            if placed:
                placed_count += 1
                # Update PLP list with new department corners
                dept = self.departments[dept_id]
                x, y = dept['location']
                width = dept['width'] if dept['current_direction'] == 'horizontal' else dept['height']
                height = dept['height'] if dept['current_direction'] == 'horizontal' else dept['width']
                
                # Add department corners to PLP
                self.plp_list.append((x, y))  # Bottom-left
                self.plp_list.append((x, y + height))  # Top-left
                self.plp_list.append((x + width, y))  # Bottom-right
                self.plp_list.append((x + width, y + height))  # Top-right
            else:
                print(f"Warning: Could not place department {dept_id}")
        
        print(f"Placed {placed_count} out of {len(self.movable_departments)} movable departments")
        
        # Check if all departments are placed
        all_placed = placed_count == len(self.movable_departments)
        return all_placed
    
    def _generate_initial_solution(self):
        """Generate an initial layout solution"""
        # Generate potential locations first
        self._generate_potential_locations()
        
        # Check if PLP list is empty
        if len(self.plp_list) == 0:
            print("Error: No potential location points available. Adding facility corners as default.")
            # Add facility corners as default PLPs
            self.plp_list = [
                (0, 0),  # Bottom-left
                (0, self.facility_height),  # Top-left
                (self.facility_width, 0),  # Bottom-right
                (self.facility_width, self.facility_height)  # Top-right
            ]
        
        # Create a random placement order with valid PLP indices
        placement_order = []
        for dept_id in self.movable_departments:
            # Ensure we have at least one PLP point
            max_idx = max(0, len(self.plp_list) - 1)
            placement_order.append((dept_id, random.randint(0, max_idx)))
        
        # Try to place all departments
        success = self._place_departments(placement_order)
        
        if success:
            # Calculate objective value
            obj_value, breakdown = self._calculate_objective_function()
            
            # Store the layout
            layout = {
                'placement_order': placement_order,
                'locations': {dept_id: dept['location'] for dept_id, dept in self.departments.items()},
                'directions': {dept_id: dept['current_direction'] for dept_id, dept in self.departments.items()},
                'objective_value': obj_value,
                'breakdown': breakdown
            }
            
            self.current_layout = layout
            
            # Update best layout if better
            if obj_value < self.best_objective_value:
                self.best_layout = layout.copy()
                self.best_objective_value = obj_value
                
            return True
        else:
            print("Failed to generate initial solution")
            return False
    
    def _generate_neighbor(self, layout):
        """Generate a neighboring solution using different operators"""
        # Choose a random operator
        operator = random.choice(['swap', 'change_location', 'change_direction', 'move_department'])
        
        # Make a copy of the placement order
        new_placement_order = layout['placement_order'].copy()
        
        if operator == 'swap':
            # Swap two departments
            if len(new_placement_order) >= 2:
                idx1, idx2 = random.sample(range(len(new_placement_order)), 2)
                new_placement_order[idx1], new_placement_order[idx2] = new_placement_order[idx2], new_placement_order[idx1]
        
        elif operator == 'change_location':
            # Change the alternative location of a random department
            if new_placement_order:
                idx = random.randint(0, len(new_placement_order) - 1)
                dept_id, _ = new_placement_order[idx]
                new_alt = random.randint(0, len(self.plp_list) - 1)
                new_placement_order[idx] = (dept_id, new_alt)
        
        elif operator == 'change_direction':
            # Change the direction of a random department if allowed
            rotatable_depts = [i for i, (dept_id, _) in enumerate(new_placement_order) 
                             if self.departments[dept_id]['can_change_direction']]
            
            if rotatable_depts:
                idx = random.choice(rotatable_depts)
                dept_id, alt = new_placement_order[idx]
                # The direction change will happen during placement
        
        elif operator == 'move_department':
            # Move a department to a completely different location
            if new_placement_order:
                idx = random.randint(0, len(new_placement_order) - 1)
                dept_id, _ = new_placement_order[idx]
                new_alt = random.randint(0, len(self.plp_list) - 1)
                new_placement_order[idx] = (dept_id, new_alt)
        
        return new_placement_order
    
    def _tabu_search(self, max_iterations=100, tabu_tenure=10, max_non_improving=30):
        """Implement tabu search for layout optimization"""
        if self.current_layout is None:
            success = self._generate_initial_solution()
            if not success:
                return False
                
        # Initialize tabu list and best solution
        tabu_list = []
        current_solution = self.current_layout
        best_solution = self.best_layout
        non_improving_iterations = 0
        
        for iteration in range(max_iterations):
            self.iterations += 1
            
            # Generate candidate neighbors
            candidates = []
            for _ in range(5):  # Generate 5 candidates
                new_placement_order = self._generate_neighbor(current_solution)
                
                # Check if the move is tabu
                # Check if the move is tabu
                is_tabu = any(self._are_similar_placements(new_placement_order, tabu) for tabu in tabu_list)
                
                if not is_tabu or (is_tabu and iteration > 0):  # Allow tabu moves after first iteration for diversification
                    # Try to place departments
                    placement_success = self._place_departments(new_placement_order)
                    
                    if placement_success:
                        # Calculate objective value
                        obj_value, breakdown = self._calculate_objective_function()
                        
                        # Create layout solution
                        layout = {
                            'placement_order': new_placement_order,
                            'locations': {dept_id: dept['location'] for dept_id, dept in self.departments.items()},
                            'directions': {dept_id: dept['current_direction'] for dept_id, dept in self.departments.items()},
                            'objective_value': obj_value,
                            'breakdown': breakdown,
                            'iteration': self.iterations
                        }
                        
                        candidates.append(layout)
            
            if not candidates:
                print(f"No valid neighbors found at iteration {iteration}")
                non_improving_iterations += 1
                if non_improving_iterations >= max_non_improving:
                    # Restart from a new random solution
                    self._generate_initial_solution()
                    current_solution = self.current_layout
                    non_improving_iterations = 0
                    continue
            else:
                # Find the best candidate
                best_candidate = min(candidates, key=lambda x: x['objective_value'])
                
                # Update current solution
                current_solution = best_candidate
                
                # Update best solution if better
                if best_candidate['objective_value'] < self.best_objective_value:
                    self.best_layout = best_candidate
                    self.best_objective_value = best_candidate['objective_value']
                    self.time_to_best = time.time() - self.start_time
                    self.improvements += 1
                    non_improving_iterations = 0
                    print(f"Iteration {iteration}: New best solution found with objective value {self.best_objective_value:.4f}")
                else:
                    non_improving_iterations += 1
                
                # Add current placement order to tabu list
                tabu_list.append(best_candidate['placement_order'])
                if len(tabu_list) > tabu_tenure:
                    tabu_list.pop(0)  # Remove oldest tabu entry
            
            # Record history for reporting
            history_entry = {
                'iteration': iteration,
                'objective_value': current_solution['objective_value'],
                'best_value': self.best_objective_value
            }
            self.history.append(history_entry)
            
            # Check termination criteria
            if non_improving_iterations >= max_non_improving:
                print(f"Stopping: No improvement for {max_non_improving} iterations")
                break
        
        # Restore best solution
        self._place_departments(self.best_layout['placement_order'])
        return True
    
    def _are_similar_placements(self, placement1, placement2, similarity_threshold=0.8):
        """Check if two placement orders are similar"""
        if len(placement1) != len(placement2):
            return False
            
        # Count matching department-alternative pairs
        matches = 0
        for (dept1, alt1), (dept2, alt2) in zip(placement1, placement2):
            if dept1 == dept2 and alt1 == alt2:
                matches += 1
                
        similarity = matches / len(placement1)
        return similarity >= similarity_threshold
    
    def _apply_best_layout(self):
        """Apply the best found layout to departments"""
        if self.best_layout is None:
            return False
            
        # Apply locations and directions from best layout
        for dept_id, location in self.best_layout['locations'].items():
            if dept_id in self.departments:
                self.departments[dept_id]['location'] = location
                
        for dept_id, direction in self.best_layout['directions'].items():
            if dept_id in self.departments:
                self.departments[dept_id]['current_direction'] = direction
                
        return True
    
    def optimize(self, iterations=200, tabu_tenure=15, max_non_improving=30, report_dir='results'):
        """Run the optimization algorithm"""
        self.start_time = time.time()
        
        print("Starting optimization...")
        
        # Generate initial solution
        initial_success = self._generate_initial_solution()
        if not initial_success:
            print("Failed to generate initial solution. Check facility dimensions and department sizes.")
            return False
            
        print(f"Initial solution objective value: {self.current_layout['objective_value']:.4f}")
        
        # Run tabu search
        tabu_success = self._tabu_search(iterations, tabu_tenure, max_non_improving)
        
        self.end_time = time.time()
        
        if tabu_success:
            # Apply best layout
            self._apply_best_layout()
            
            print("\nOptimization complete!")
            print(f"Best objective value: {self.best_objective_value:.4f}")
            print(f"Total iterations: {self.iterations}")
            print(f"Total improvements: {self.improvements}")
            print(f"Total optimization time: {self.end_time - self.start_time:.2f} seconds")
            print(f"Time to best solution: {self.time_to_best:.2f} seconds")
            
            # Generate report
            self.generate_report(report_dir)
            
            return True
        else:
            print("Optimization failed")
            return False
    
    def visualize_layout(self, show_flow=True, save_path=None):
        """Visualize the current facility layout"""
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Draw facility boundaries
        rect = patches.Rectangle((0, 0), self.facility_width, self.facility_height, 
                                linewidth=2, edgecolor='black', facecolor='none')
        ax.add_patch(rect)
        
        # Draw obstacles
        for obstacle in self.obstacles:
            rect = patches.Rectangle((obstacle['x'], obstacle['y']), 
                                    obstacle['width'], obstacle['height'],
                                    linewidth=1, edgecolor='black', 
                                    facecolor='gray', alpha=0.5)
            ax.add_patch(rect)
        
        # Draw special locations
        for loc_id, loc in self.special_locations.items():
            marker = 'o' if loc['type'] in ['entry', 'exit'] else 's'
            color = 'green' if loc['type'] == 'entry' else 'red' if loc['type'] == 'exit' else 'purple'
            ax.plot(loc['x'], loc['y'], marker=marker, markersize=10, color=color, label=f"{loc_id} ({loc['type']})")
        
        # Generate colors for departments
        dept_colors = {}
        cmap = plt.cm.get_cmap('tab20', len(self.departments))
        
        for i, dept_id in enumerate(self.departments.keys()):
            dept_colors[dept_id] = cmap(i)
        
        # Draw departments
        for dept_id, dept in self.departments.items():
            if dept['location'] is None:
                continue
                
            x, y = dept['location']
            if dept['current_direction'] == 'horizontal':
                width, height = dept['width'], dept['height']
            else:
                width, height = dept['height'], dept['width']
                
            # Different border style for fixed departments
            edge_style = 'solid' if dept_id not in self.fixed_departments else 'dashed'
            linewidth = 1 if dept_id not in self.fixed_departments else 2
            
            rect = patches.Rectangle((x, y), width, height,
                                  linewidth=linewidth, edgecolor='black',
                                  linestyle=edge_style,
                                  facecolor=dept_colors[dept_id], alpha=0.7)
            ax.add_patch(rect)
            
            # Add department label
            ax.text(x + width/2, y + height/2, dept_id,
                 horizontalalignment='center', verticalalignment='center',
                 fontsize=10, fontweight='bold')
        
        # Draw flow lines between departments if requested
        if show_flow and self.flow_matrix is not None:
            # Normalize flow for line thickness
            max_flow = self.flow_matrix.max().max()
            
            for dept1_id, dept1 in self.departments.items():
                if dept1['location'] is None:
                    continue
                    
                center1 = self._find_center(dept1)
                
                for dept2_id, dept2 in self.departments.items():
                    if dept1_id >= dept2_id or dept2['location'] is None:
                        continue
                        
                    flow = self.flow_matrix.loc[dept1_id, dept2_id]
                    
                    if flow > 0:
                        center2 = self._find_center(dept2)
                        
                        # Scale line thickness by flow
                        thickness = max(0.5, min(3.5, 0.5 + 3 * flow / max_flow))
                        
                        # Draw line
                        ax.plot([center1[0], center2[0]], [center1[1], center2[1]], 
                             'b-', linewidth=thickness, alpha=0.4)
        
        # Set axis limits
        ax.set_xlim(-1, self.facility_width + 1)
        ax.set_ylim(-1, self.facility_height + 1)
        
        # Add title and labels
        ax.set_title('Facility Layout', fontsize=16)
        ax.set_xlabel('Width (m)', fontsize=12)
        ax.set_ylabel('Height (m)', fontsize=12)
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Layout visualization saved to {save_path}")
        
        plt.show()
        
        return fig, ax
    
    def visualize_flow_network(self, save_path=None):
        """Visualize the material flow network between departments"""
        if self.flow_matrix is None:
            print("No flow matrix available")
            return None
            
        # Create directed graph
        G = nx.DiGraph()
        
        # Add nodes for all departments
        for dept_id, dept in self.departments.items():
            if dept['location'] is not None:
                center = self._find_center(dept)
                G.add_node(dept_id, pos=center)
        
        # Add edges with weights based on flow
        for dept1_id in G.nodes():
            for dept2_id in G.nodes():
                if dept1_id != dept2_id:
                    flow = self.flow_matrix.loc[dept1_id, dept2_id]
                    if flow > 0:
                        G.add_edge(dept1_id, dept2_id, weight=flow)
        
        # Get node positions
        pos = nx.get_node_attributes(G, 'pos')
        
        # Create figure
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Draw facility boundaries
        rect = patches.Rectangle((0, 0), self.facility_width, self.facility_height, 
                              linewidth=2, edgecolor='black', facecolor='none')
        ax.add_patch(rect)
        
        # Draw departments as background
        for dept_id, dept in self.departments.items():
            if dept['location'] is None:
                continue
                
            x, y = dept['location']
            if dept['current_direction'] == 'horizontal':
                width, height = dept['width'], dept['height']
            else:
                width, height = dept['height'], dept['width']
                
            rect = patches.Rectangle((x, y), width, height,
                                  linewidth=1, edgecolor='black',
                                  facecolor='lightgray', alpha=0.3)
            ax.add_patch(rect)
            
            # Add department label
            ax.text(x + width/2, y + height/2, dept_id,
                 horizontalalignment='center', verticalalignment='center',
                 fontsize=10, fontweight='bold')
        
        # Get edge weights for line thickness
        edge_weights = [G[u][v]['weight'] for u, v in G.edges()]
        max_weight = max(edge_weights) if edge_weights else 1
        
        # Normalize weights to line thickness
        edge_widths = [1 + 5 * (w / max_weight) for w in edge_weights]
        
        # Draw the graph
        nx.draw_networkx_nodes(G, pos, node_size=800, node_color='skyblue')
        nx.draw_networkx_labels(G, pos, font_size=12)
        nx.draw_networkx_edges(G, pos, width=edge_widths, edge_color='blue', 
                            alpha=0.7, arrows=True, arrowsize=15)
        
        # Add edge labels (flow values)
        edge_labels = {(u, v): f"{G[u][v]['weight']}" for u, v in G.edges()}
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
        
        # Set axis limits
        ax.set_xlim(-1, self.facility_width + 1)
        ax.set_ylim(-1, self.facility_height + 1)
        
        # Add title
        ax.set_title('Material Flow Network', fontsize=16)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Flow network visualization saved to {save_path}")
        
        plt.show()
        
        return fig, ax
    
    def visualize_optimization_progress(self, save_path=None):
        """Visualize the optimization progress"""
        if not self.history:
            print("No optimization history available")
            return None
            
        # Extract data from history
        iterations = [entry['iteration'] for entry in self.history]
        obj_values = [entry['objective_value'] for entry in self.history]
        best_values = [entry['best_value'] for entry in self.history]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot current solution objective values
        ax.plot(iterations, obj_values, 'b-', alpha=0.5, label='Current Solution')
        
        # Plot best solution objective values
        ax.plot(iterations, best_values, 'r-', linewidth=2, label='Best Solution')
        
        # Add vertical line for when best solution was found
        best_iteration = iterations[best_values.index(min(best_values))]
        ax.axvline(x=best_iteration, color='green', linestyle='--', 
                alpha=0.7, label=f'Best Found (Iter {best_iteration})')
        
        # Add labels and legend
        ax.set_title('Optimization Progress', fontsize=16)
        ax.set_xlabel('Iteration', fontsize=12)
        ax.set_ylabel('Objective Value', fontsize=12)
        ax.legend()
        
        # Add grid
        ax.grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Optimization progress visualization saved to {save_path}")
        
        plt.show()
        
        return fig, ax
    
    def visualize_component_breakdown(self, save_path=None):
        """Visualize the breakdown of objective function components"""
        if self.best_layout is None or 'breakdown' not in self.best_layout:
            print("No solution breakdown available")
            return None
            
        breakdown = self.best_layout['breakdown']
        
        # Extract components
        components = {
            'Distance Cost': breakdown['distance_cost'],
            'Adjacency Score': breakdown['adjacency_score'],
            'Safety Score': breakdown['safety_score'],
            'Flexibility Score': breakdown['flexibility_score']
        }
        
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Create bar chart
        bars = ax.bar(components.keys(), components.values())
        
        # Color bars based on whether lower is better (red) or higher is better (green)
        bar_colors = ['red', 'green', 'green', 'green']
        for bar, color in zip(bars, bar_colors):
            bar.set_color(color)
        
        # Add values on top of bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                 f'{height:.1f}',
                 ha='center', va='bottom', fontsize=10)
        
        # Add labels and title
        ax.set_title('Objective Function Component Breakdown', fontsize=16)
        ax.set_ylabel('Value', fontsize=12)
        
        # Add a legend explaining colors
        red_patch = patches.Patch(color='red', label='Lower is better')
        green_patch = patches.Patch(color='green', label='Higher is better')
        ax.legend(handles=[red_patch, green_patch])
        
        # Add grid
        ax.grid(True, axis='y', linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Component breakdown visualization saved to {save_path}")
        
        plt.show()
        
        return fig, ax
    
    def generate_report(self, report_dir='results', language='en'):
        """Generate a comprehensive report of the optimization results
        
        Parameters:
        -----------
        report_dir : str
            Directory to save the report files
        language : str
            Language for the report ('en' for English, 'tr' for Turkish)
        """
        if self.best_layout is None:
            print("No optimization results to report")
            return False
            
        # Create report directory if it doesn't exist
        os.makedirs(report_dir, exist_ok=True)
        
        # Generate timestamp for report files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save visualizations
        layout_img_path = os.path.join(report_dir, f'layout_{timestamp}.png')
        flow_img_path = os.path.join(report_dir, f'flow_network_{timestamp}.png')
        progress_img_path = os.path.join(report_dir, f'progress_{timestamp}.png')
        breakdown_img_path = os.path.join(report_dir, f'breakdown_{timestamp}.png')
        
        self.visualize_layout(save_path=layout_img_path)
        
        if self.flow_matrix is not None:
            self.visualize_flow_network(save_path=flow_img_path)
            
        if self.history:
            self.visualize_optimization_progress(save_path=progress_img_path)
            
        self.visualize_component_breakdown(save_path=breakdown_img_path)
        
        # Translation dictionary
        translations = {
            'en': {
                'title': 'UA-FLP Optimization Report',
                'report_header': 'Unequal Area Facility Layout Problem Optimization Report',
                'generated_on': 'Generated on',
                'facility_info': 'Facility Information',
                'parameter': 'Parameter',
                'value': 'Value',
                'facility_width': 'Facility Width',
                'facility_height': 'Facility Height',
                'facility_area': 'Facility Area',
                'total_departments': 'Total Departments',
                'fixed_departments': 'Fixed Departments',
                'movable_departments': 'Movable Departments',
                'department_info': 'Department Information',
                'id': 'ID',
                'width': 'Width',
                'height': 'Height',
                'area': 'Area',
                'fixed': 'Fixed',
                'can_change_direction': 'Can Change Direction',
                'final_location': 'Final Location',
                'final_direction': 'Final Direction',
                'yes': 'Yes',
                'no': 'No',
                'not_placed': 'Not placed',
                'horizontal': 'horizontal',
                'vertical': 'vertical',
                'optimization_results': 'Optimization Results',
                'best_objective_value': 'Best Objective Value',
                'total_iterations': 'Total Iterations',
                'improvements_found': 'Improvements Found',
                'total_optimization_time': 'Total Optimization Time',
                'time_to_best_solution': 'Time to Best Solution',
                'seconds': 'seconds',
                'objective_function_breakdown': 'Objective Function Breakdown',
                'component': 'Component',
                'weight': 'Weight',
                'contribution': 'Contribution',
                'distance_cost': 'Distance Cost',
                'adjacency_score': 'Adjacency Score',
                'safety_score': 'Safety Score',
                'flexibility_score': 'Flexibility Score',
                'total': 'Total',
                'visualizations': 'Visualizations',
                'final_facility_layout': 'Final Facility Layout',
                'material_flow_network': 'Material Flow Network',
                'optimization_progress': 'Optimization Progress',
                'objective_function_components': 'Objective Function Components',
                'footer': 'Report generated by Enhanced UA-FLP Solver',
                'switch_language': 'Türkçe Göster',
                'switch_language_url': f'report_{timestamp}_tr.html'
            },
            'tr': {
                'title': 'UA-FLP Optimizasyon Raporu',
                'report_header': 'Eşit Olmayan Alan Tesis Yerleşim Problemi Optimizasyon Raporu',
                'generated_on': 'Oluşturulma tarihi',
                'facility_info': 'Tesis Bilgileri',
                'parameter': 'Parametre',
                'value': 'Değer',
                'facility_width': 'Tesis Genişliği',
                'facility_height': 'Tesis Yüksekliği',
                'facility_area': 'Tesis Alanı',
                'total_departments': 'Toplam Departman Sayısı',
                'fixed_departments': 'Sabit Departman Sayısı',
                'movable_departments': 'Hareketli Departman Sayısı',
                'department_info': 'Departman Bilgileri',
                'id': 'ID',
                'width': 'Genişlik',
                'height': 'Yükseklik',
                'area': 'Alan',
                'fixed': 'Sabit',
                'can_change_direction': 'Döndürülebilir',
                'final_location': 'Son Konum',
                'final_direction': 'Son Yön',
                'yes': 'Evet',
                'no': 'Hayır',
                'not_placed': 'Yerleştirilmemiş',
                'horizontal': 'yatay',
                'vertical': 'dikey',
                'optimization_results': 'Optimizasyon Sonuçları',
                'best_objective_value': 'En İyi Amaç Fonksiyonu Değeri',
                'total_iterations': 'Toplam İterasyon Sayısı',
                'improvements_found': 'Bulunan İyileştirme Sayısı',
                'total_optimization_time': 'Toplam Optimizasyon Süresi',
                'time_to_best_solution': 'En İyi Çözüme Ulaşma Süresi',
                'seconds': 'saniye',
                'objective_function_breakdown': 'Amaç Fonksiyonu Detayları',
                'component': 'Bileşen',
                'weight': 'Ağırlık',
                'contribution': 'Katkı',
                'distance_cost': 'Mesafe Maliyeti',
                'adjacency_score': 'Yakınlık Skoru',
                'safety_score': 'Güvenlik Skoru',
                'flexibility_score': 'Esneklik Skoru',
                'total': 'Toplam',
                'visualizations': 'Görselleştirmeler',
                'final_facility_layout': 'Son Tesis Yerleşim Planı',
                'material_flow_network': 'Malzeme Akış Ağı',
                'optimization_progress': 'Optimizasyon İlerleme Grafiği',
                'objective_function_components': 'Amaç Fonksiyonu Bileşenleri',
                'footer': 'Rapor, Gelişmiş UA-FLP Çözücüsü tarafından oluşturulmuştur',
                'switch_language': 'Show in English',
                'switch_language_url': f'report_{timestamp}_en.html'
            }
        }
        
        # Make sure language is valid
        if language not in translations:
            language = 'en'
        
        # Pick translation dictionary based on language
        t = translations[language]
        
        # Generate report filenames
        en_html_path = os.path.join(report_dir, f'report_{timestamp}_en.html')
        tr_html_path = os.path.join(report_dir, f'report_{timestamp}_tr.html')
        
        # Report path to use based on selected language
        html_path = en_html_path if language == 'en' else tr_html_path
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write('<!DOCTYPE html>\n')
            f.write('<html>\n')
            f.write('<head>\n')
            f.write(f'<title>{t["title"]}</title>\n')
            f.write('<meta charset="UTF-8">\n')
            f.write('<style>\n')
            f.write('body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }\n')
            f.write('h1, h2, h3 { color: #2c3e50; }\n')
            f.write('table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }\n')
            f.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n')
            f.write('th { background-color: #f2f2f2; }\n')
            f.write('tr:nth-child(even) { background-color: #f9f9f9; }\n')
            f.write('.section { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }\n')
            f.write('.image-container { margin: 20px 0; text-align: center; }\n')
            f.write('.image-container img { max-width: 100%; box-shadow: 0 0 10px rgba(0,0,0,0.1); }\n')
            f.write('.language-switch { text-align: right; margin-bottom: 20px; }\n')
            f.write('</style>\n')
            f.write('</head>\n')
            f.write('<body>\n')
            
            # Language switch
            f.write('<div class="language-switch">\n')
            f.write(f'<a href="{t["switch_language_url"]}">{t["switch_language"]}</a>\n')
            f.write('</div>\n')
            
            # Header
            f.write('<div class="section">\n')
            f.write(f'<h1>{t["report_header"]}</h1>\n')
            f.write(f'<p>{t["generated_on"]}: {datetime.now().strftime("%Y-%m-%d %H%M%S")}</p>\n')
            f.write('</div>\n')
            
            # Facility information
            f.write('<div class="section">\n')
            f.write(f'<h2>{t["facility_info"]}</h2>\n')
            f.write('<table>\n')
            f.write(f'<tr><th>{t["parameter"]}</th><th>{t["value"]}</th></tr>\n')
            f.write(f'<tr><td>{t["facility_width"]}</td><td>{self.facility_width} m</td></tr>\n')
            f.write(f'<tr><td>{t["facility_height"]}</td><td>{self.facility_height} m</td></tr>\n')
            f.write(f'<tr><td>{t["facility_area"]}</td><td>{self.facility_width*self.facility_height} m²</td></tr>\n')
            f.write(f'<tr><td>{t["total_departments"]}</td><td>{len(self.departments)}</td></tr>\n')
            f.write(f'<tr><td>{t["fixed_departments"]}</td><td>{len(self.fixed_departments)}</td></tr>\n')
            f.write(f'<tr><td>{t["movable_departments"]}</td><td>{len(self.movable_departments)}</td></tr>\n')
            f.write('</table>\n')
            f.write('</div>\n')
            
            # Department information
            f.write('<div class="section">\n')
            f.write(f'<h2>{t["department_info"]}</h2>\n')
            f.write('<table>\n')
            f.write(f'<tr><th>{t["id"]}</th><th>{t["width"]}</th><th>{t["height"]}</th><th>{t["area"]}</th>')
            f.write(f'<th>{t["fixed"]}</th><th>{t["can_change_direction"]}</th>')
            f.write(f'<th>{t["final_location"]}</th><th>{t["final_direction"]}</th></tr>\n')
            
            for dept_id, dept in self.departments.items():
                location = dept['location']
                if location is None:
                    location_str = t["not_placed"]
                else:
                    location_str = f"({location[0]:.1f}, {location[1]:.1f})"
                
                # Translate direction
                direction_str = t["horizontal"] if dept["current_direction"] == "horizontal" else t["vertical"]
                    
                f.write(f'<tr>\n')
                f.write(f'<td>{dept_id}</td>\n')
                f.write(f'<td>{dept["width"]:.1f} m</td>\n')
                f.write(f'<td>{dept["height"]:.1f} m</td>\n')
                f.write(f'<td>{dept["area"]:.1f} m²</td>\n')
                f.write(f'<td>{t["yes"] if dept["fixed"] else t["no"]}</td>\n')
                f.write(f'<td>{t["yes"] if dept["can_change_direction"] else t["no"]}</td>\n')
                f.write(f'<td>{location_str}</td>\n')
                f.write(f'<td>{direction_str}</td>\n')
                f.write(f'</tr>\n')
            
            f.write('</table>\n')
            f.write('</div>\n')
            
            # Optimization results
            f.write('<div class="section">\n')
            f.write(f'<h2>{t["optimization_results"]}</h2>\n')
            f.write('<table>\n')
            f.write(f'<tr><th>{t["parameter"]}</th><th>{t["value"]}</th></tr>\n')
            f.write(f'<tr><td>{t["best_objective_value"]}</td><td>{self.best_objective_value:.4f}</td></tr>\n')
            f.write(f'<tr><td>{t["total_iterations"]}</td><td>{self.iterations}</td></tr>\n')
            f.write(f'<tr><td>{t["improvements_found"]}</td><td>{self.improvements}</td></tr>\n')
            f.write(f'<tr><td>{t["total_optimization_time"]}</td><td>{self.end_time - self.start_time:.2f} {t["seconds"]}</td></tr>\n')
            f.write(f'<tr><td>{t["time_to_best_solution"]}</td><td>{self.time_to_best:.2f} {t["seconds"]}</td></tr>\n')
            f.write('</table>\n')
            
            # Objective function breakdown
            if 'breakdown' in self.best_layout:
                breakdown = self.best_layout['breakdown']
                f.write(f'<h3>{t["objective_function_breakdown"]}</h3>\n')
                f.write('<table>\n')
                f.write(f'<tr><th>{t["component"]}</th><th>{t["value"]}</th><th>{t["weight"]}</th><th>{t["contribution"]}</th></tr>\n')
                
                # Calculate normalized values
                norm_distance = min(1.0, breakdown['distance_cost'] / (1000 + 1e-10))
                norm_adjacency = min(1.0, max(0, breakdown['adjacency_score']) / (100 + 1e-10))
                norm_safety = min(1.0, max(0, breakdown['safety_score']) / (50 + 1e-10))
                norm_flexibility = min(1.0, max(0, breakdown['flexibility_score']) / (50 + 1e-10))
                
                # Write table rows
                f.write(f'<tr><td>{t["distance_cost"]}</td><td>{breakdown["distance_cost"]:.2f}</td><td>{self.weights["distance"]:.2f}</td><td>{self.weights["distance"]*norm_distance:.4f}</td></tr>\n')
                f.write(f'<tr><td>{t["adjacency_score"]}</td><td>{breakdown["adjacency_score"]:.2f}</td><td>{self.weights["adjacency"]:.2f}</td><td>{-self.weights["adjacency"]*norm_adjacency:.4f}</td></tr>\n')
                f.write(f'<tr><td>{t["safety_score"]}</td><td>{breakdown["safety_score"]:.2f}</td><td>{self.weights["safety"]:.2f}</td><td>{-self.weights["safety"]*norm_safety:.4f}</td></tr>\n')
                f.write(f'<tr><td>{t["flexibility_score"]}</td><td>{breakdown["flexibility_score"]:.2f}</td><td>{self.weights["flexibility"]:.2f}</td><td>{-self.weights["flexibility"]*norm_flexibility:.4f}</td></tr>\n')
                f.write(f'<tr><td><strong>{t["total"]}</strong></td><td>-</td><td>-</td><td><strong>{breakdown["objective_value"]:.4f}</strong></td></tr>\n')
                f.write('</table>\n')
            
            f.write('</div>\n')
            
            # Visualizations
            f.write('<div class="section">\n')
            f.write(f'<h2>{t["visualizations"]}</h2>\n')
            
            # Layout visualization
            f.write('<div class="image-container">\n')
            f.write(f'<h3>{t["final_facility_layout"]}</h3>\n')
            f.write(f'<img src="{os.path.basename(layout_img_path)}" alt="Facility Layout">\n')
            f.write('</div>\n')
            
            # Flow network visualization
            if self.flow_matrix is not None:
                f.write('<div class="image-container">\n')
                f.write(f'<h3>{t["material_flow_network"]}</h3>\n')
                f.write(f'<img src="{os.path.basename(flow_img_path)}" alt="Flow Network">\n')
                f.write('</div>\n')
            
            # Optimization progress
            if self.history:
                f.write('<div class="image-container">\n')
                f.write(f'<h3>{t["optimization_progress"]}</h3>\n')
                f.write(f'<img src="{os.path.basename(progress_img_path)}" alt="Optimization Progress">\n')
                f.write('</div>\n')
            
            # Component breakdown visualization
            f.write('<div class="image-container">\n')
            f.write(f'<h3>{t["objective_function_components"]}</h3>\n')
            f.write(f'<img src="{os.path.basename(breakdown_img_path)}" alt="Component Breakdown">\n')
            f.write('</div>\n')
            
            f.write('</div>\n')
            
            # Footer
            f.write('<div class="section">\n')
            f.write(f'<p>{t["footer"]}</p>\n')
            f.write('</div>\n')
            
            f.write('</body>\n')
            f.write('</html>\n')
        
        # If we're generating the English version, also generate the Turkish version
        if language == 'en':
            self.generate_report(report_dir, 'tr')
            print(f"Comprehensive reports generated at:\n- {en_html_path} (English)\n- {tr_html_path} (Turkish)")
        else:
            print(f"Comprehensive report generated at {html_path} ({language})")
        
        # Save solution data as JSON
        json_path = os.path.join(report_dir, f'solution_{timestamp}.json')
        
        solution_data = {
            'facility': {
                'width': self.facility_width,
                'height': self.facility_height
            },
            'departments': {dept_id: {k: v for k, v in dept.items() if not callable(v)} 
                          for dept_id, dept in self.departments.items()},
            'optimization': {
                'objective_value': self.best_objective_value,
                'iterations': self.iterations,
                'improvements': self.improvements,
                'time': self.end_time - self.start_time,
                'time_to_best': self.time_to_best
            }
        }
        
        with open(json_path, 'w') as f:
            json.dump(solution_data, f, indent=2)
        
        print(f"Solution data saved to {json_path}")
        
        return html_path


def example_problem():
    """
    Example usage of the Enhanced UA-FLP Solver based on the illustrative example in the paper
    """
    print("Creating example problem...")
    
    # Initialize the solver
    flp = EnhancedUAFLP(facility_width=25, facility_height=25)
    
    # Add fixed departments (like forklift ways)
    flp.add_department("F1", width=5, height=1, fixed=True, fixed_location=(5, 5))
    flp.add_department("F2", width=1, height=5, fixed=True, fixed_location=(15, 10))
    
    # Add obstacles (columns, walls, etc.)
    flp.add_obstacle(x=2, y=2, width=1, height=1, obstacle_type="column")
    flp.add_obstacle(x=22, y=22, width=1, height=1, obstacle_type="column")
    
    # Add special locations (entries, exits)
    flp.add_special_location("Entrance", x=0, y=12, location_type="entry")
    flp.add_special_location("Exit", x=25, y=12, location_type="exit")
    flp.add_special_location("EmergencyExit", x=12, y=25, location_type="emergency_exit")
    
    # Add departments with enhanced attributes
    flp.add_department("D1", width=4, height=3, growth_factor=0.2, external_access_needed=True)
    flp.add_department("D2", width=5, height=4, safety_level=2)
    flp.add_department("D3", width=3, height=6, natural_light_needed=True)
    flp.add_department("D4", width=4, height=4, can_change_direction=False)
    flp.add_department("D5", width=6, height=2, growth_factor=0.5)
    flp.add_department("D6", width=3, height=3, safety_level=3, external_access_needed=True)
    flp.add_department("D7", width=5, height=3)
    flp.add_department("D8", width=2, height=5)
    
    # Define flow matrix (dictionary format)
    flow_data = {
        ("D1", "D2"): 10,
        ("D1", "D3"): 5,
        ("D2", "D4"): 8,
        ("D3", "D5"): 6,
        ("D4", "D6"): 7,
        ("D5", "D7"): 4,
        ("D6", "D8"): 9,
        ("D7", "D8"): 3,
        ("D2", "D7"): 5,
        ("D3", "D6"): 4
    }
    flp.set_flow_matrix(flow_data)
    
    # Define relationship matrix (A=4, E=3, I=2, O=1, U=0, X=-1)
    relationship_data = {
        ("D1", "D2"): "A",  # Absolutely necessary
        ("D1", "D3"): "E",  # Especially important
        ("D2", "D4"): "I",  # Important
        ("D3", "D5"): "O",  # Ordinary
        ("D4", "D6"): "U",  # Unimportant
        ("D5", "D7"): "X",  # Undesirable
        ("D6", "D8"): "A",
        ("D7", "D8"): "E"
    }
    flp.set_relationship_matrix(relationship_data)
    
    # Define precedence matrix (process flow requirements)
    precedence_data = {
        ("D1", "D2"): 1,  # D1 should precede D2
        ("D2", "D3"): 1,
        ("D3", "D4"): 1,
        ("D4", "D5"): 1
    }
    flp.set_precedence_matrix(precedence_data)
    
    # Set environmental factors
    noise_matrix = {
        "D2": 2,  # D2 has noise level 2
        "D6": 3   # D6 has noise level 3
    }
    hazard_matrix = {
        "D5": 1,  # D5 has hazard level 1
        "D6": 2   # D6 has hazard level 2
    }
    vibration_matrix = {
        "D4": 2,  # D4 has vibration level 2
        "D7": 1   # D7 has vibration level 1
    }
    flp.set_environment_factors(noise_matrix, hazard_matrix, vibration_matrix)
    
    # Set weights for multi-objective optimization
    weights = {
        'distance': 0.5,    # Material handling cost (less focus)
        'adjacency': 0.3,   # Adjacency relationships (medium focus)
        'safety': 0.15,     # Safety considerations
        'flexibility': 0.05 # Future flexibility
    }
    flp.set_weights(weights)
    
    # Run optimization
    print("\nStarting optimization process...")
    flp.optimize(iterations=150, tabu_tenure=12, max_non_improving=25)
    
    # Visualize results
    flp.visualize_layout(show_flow=True)
    flp.visualize_flow_network()
    flp.visualize_optimization_progress()
    flp.visualize_component_breakdown()
    
    print("\nExample problem completed.")
    return flp

# Main execution
if __name__ == "__main__":
    print("Enhanced UA-FLP Solver Example")
    print("==============================")
    example = example_problem()